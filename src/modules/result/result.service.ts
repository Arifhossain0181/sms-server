import prisma from "../../config/db";
import { ResultStatus } from "../../generated/prisma/enums";
import { SubmitResultDto, UpdateMarkDto } from "./result.dto";
import { getIO } from "../../config/socket";

const STAFF_OVERRIDE_ROLES = new Set(["SCHOOL_ADMIN", "SUPER_ADMIN", "EXAM_CONTROLLER"]);

type GradingRule = { minMark: number; maxMark: number; grade: string; gpaPoint: number };

// FIX: was a hardcoded ladder duplicating (and disagreeing with) the grading
// logic in exam.service.ts. Now reads the same DB-driven GradingRule table
// so a student's grade is identical no matter which endpoint entered it.
async function loadGradingRules(): Promise<GradingRule[]> {
    return prisma.gradingRule.findMany({
        orderBy: { minMark: 'asc' },
        select: { minMark: true, maxMark: true, grade: true, gpaPoint: true },
    });
}

function resolveGrade(marksObtained: number, fullMarks: number, rules: GradingRule[]) {
    const matchedRule = rules.find((rule) => marksObtained >= rule.minMark && marksObtained <= rule.maxMark);
    return { grade: matchedRule?.grade ?? 'F', gpa: matchedRule?.gpaPoint ?? 0 };
}

const recalculateAndSaveReportCard = async (
    studentId: string,
    examId: string,
    gradingRules: GradingRule[],
) => {
    const marks = await prisma.mark.findMany({
        where: { studentId, examId },
        include: { subject: { select: { fullMarks: true, passMarks: true } } },
    });

    const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalFull = marks.reduce((sum, m) => sum + m.subject.fullMarks, 0);
    const percentage = totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : 0;
    const failed = marks.some((m) => m.marksObtained < m.subject.passMarks);

    const gpas = marks.filter((m) => m.gpa != null).map((m) => m.gpa as number);
    const avgGpa = gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : null;
    const worstGrade = marks.reduce((min, m) => ((m.gpa ?? 0) < (min.gpa ?? Infinity) ? m : min)).grade ?? null;

    const reportCard = await prisma.reportCard.upsert({
        where: { studentId_examId: { studentId, examId } },
        create: { studentId, examId, gpa: avgGpa, status: ResultStatus.UNPUBLISHED },
        update: { gpa: avgGpa },
    });

    return { reportCard, totalObtained, totalFull, percentage, grade: worstGrade, gpa: avgGpa, isPassed: !failed };
};

export const submitResult = async (
    dto: SubmitResultDto,
    authUser?: { id: string; role: string },
) => {
    if (!dto.examId) throw { status: 400, message: "examId is required" };
    const exam = await prisma.exam.findUnique({ where: { id: dto.examId } });
    if (!exam) throw { status: 404, message: "Exam not found" };

    const student = await prisma.student.findUnique({ where: { id: dto.studentId }, select: { id: true } });
    if (!student) throw { status: 404, message: "Student not found" };

    if (!dto.marks.length) throw { status: 400, message: "At least one subject mark is required" };

    let currentTeacherId: string | undefined;
    const isStaffOverride = !!authUser?.role && STAFF_OVERRIDE_ROLES.has(authUser.role);

    if (authUser?.role === "TEACHER") {
        const teacher = await prisma.teacher.findUnique({ where: { userId: authUser.id }, select: { id: true } });
        if (!teacher) throw { status: 403, message: "Teacher profile not found for this user" };
        currentTeacherId = teacher.id;
    } else if (!isStaffOverride) {
        // previously any non-TEACHER role fell through to the "admin"
        // branch below and could submit marks. Now only explicit staff
        // roles get that path — everyone else (STUDENT, PARENT, ACCOUNTANT,
        // etc.) is rejected outright.
        throw { status: 403, message: "You are not authorized to submit exam results" };
    }

    const subjects = await prisma.subject.findMany({
        where: { id: { in: dto.marks.map((m) => m.subjectId) } },
        include: { assignments: { select: { teacherId: true } } },
    });
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));
    const gradingRules = await loadGradingRules();

    await prisma.$transaction(async (tx) => {
        for (const m of dto.marks) {
            const subject = subjectMap.get(m.subjectId);
            if (!subject) throw { status: 404, message: `Subject not found: ${m.subjectId}` };

            if (m.marksObtained < 0 || m.marksObtained > subject.fullMarks) {
                throw { status: 400, message: `Marks must be between 0 and ${subject.fullMarks} for ${subject.name}` };
            }

            let teacherToAssign: string | undefined;

            if (currentTeacherId) {
                const isAssignedToSubject = subject.assignments.some((a) => a.teacherId === currentTeacherId);
                if (!isAssignedToSubject) {
                    throw {
                        status: 403,
                        message: `You are not assigned to teach ${subject.name}. Please use an assigned subject.`,
                    };
                }
                teacherToAssign = currentTeacherId;
            } else {
                if (subject.assignments.length > 0) {
                    teacherToAssign = subject.assignments[0].teacherId;
                } else {
                    throw {
                        status: 400,
                        message: `No teacher assigned to subject "${subject.name}". Please assign a teacher to this subject first.`,
                    };
                }
            }

            const { grade, gpa } = resolveGrade(m.marksObtained, subject.fullMarks, gradingRules);

            await tx.mark.upsert({
                where: {
                    studentId_examId_subjectId: { studentId: dto.studentId, examId: dto.examId, subjectId: m.subjectId },
                },
                create: {
                    studentId: dto.studentId,
                    examId: dto.examId,
                    subjectId: m.subjectId,
                    teacherId: teacherToAssign,
                    marksObtained: m.marksObtained,
                    grade,
                    gpa,
                },
                update: {
                    teacherId: teacherToAssign,
                    marksObtained: m.marksObtained,
                    grade,
                    gpa,
                },
            });
        }
    });

    const summary = await recalculateAndSaveReportCard(dto.studentId, dto.examId, gradingRules);

    // FIX: NFR Auditability — marks entry must be logged.
    if (authUser?.id) {
        await prisma.auditLog.create({
            data: {
                userId: authUser.id,
                action: 'RESULT_SUBMITTED',
                targetId: `${dto.studentId}:${dto.examId}`,
                meta: { subjectCount: dto.marks.length },
                timestamp: new Date(),
            },
        }).catch((err) => console.warn('Audit log failed:', err?.message));
    }

    // this used to emit straight to the student with grade/percentage
    // attached — before the Exam Controller had published anything. That's
    // a real result leak via websocket, bypassing any REST-level publish
    // gate. Now it only pings a staff room that marks are in, with no score
    // details for the student to see. The actual student-facing
    // "your result is published" notification belongs in exam.service.ts's
    // publishExam(), which is the real publish action.
    try {
        getIO().to("EXAM_CONTROLLER").emit("marks:submitted", {
            examId: dto.examId,
            studentId: dto.studentId,
            subjectsGraded: dto.marks.length,
        });
    } catch (_) {
        // ignore socket errors
    }

    return { success: true, message: "Result submitted successfully", summary };
};

/**
 * previously threw on the first failure, but every student processed
 * *before* the failure had already been committed (each submitResult runs
 * its own transaction) — the caller was told "failed" while most of the
 * batch had actually succeeded. Now every entry is attempted independently
 * and the response honestly reports which ones succeeded and which failed.
 */
export const submitBulkResult = async (
    dtos: SubmitResultDto[],
    authUser?: { id: string; role: string },
) => {
    if (!dtos || dtos.length === 0) {
        throw { status: 400, message: "No result entries provided" };
    }

    const succeeded: any[] = [];
    const failed: { studentId: string; error: string }[] = [];

    for (const dto of dtos) {
        try {
            const result = await submitResult(dto, authUser);
            succeeded.push(result);
        } catch (error: any) {
            failed.push({ studentId: dto.studentId, error: error?.message || 'Unknown error' });
        }
    }

    return {
        success: failed.length === 0,
        message: `${succeeded.length} succeeded, ${failed.length} failed out of ${dtos.length}`,
        totalProcessed: succeeded.length,
        results: succeeded,
        failures: failed,
    };
};

/**
 * Student/Parent-facing — FIX: previously returned marks with no regard to
 * publish status at all. Now only returns marks for exams where this
 * student's ReportCard is PUBLISHED, matching the same rule enforced in
 * exam.service.ts's getPublishedResultsForStudent.
 */
export const getResultByStudent = async (
    studentId: string,
    examId?: string,
    limit: number = 10,
) => {
    const publishedExamIds = await prisma.reportCard.findMany({
        where: {
            studentId,
            status: ResultStatus.PUBLISHED,
            ...(examId && { examId }),
        },
        select: { examId: true },
    }).then((rows) => rows.map((r) => r.examId));

    if (!publishedExamIds.length) {
        return { studentId, examId: examId ?? null, totalObtained: 0, totalFull: 0, percentage: 0, marks: [] };
    }

    const marks = await prisma.mark.findMany({
        where: { studentId, examId: { in: publishedExamIds } },
        select: {
            id: true,
            marksObtained: true,
            grade: true,
            examId: true,
            exam: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true, fullMarks: true, passMarks: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalFull = marks.reduce((sum, m) => sum + m.subject.fullMarks, 0);
    const percentage = totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : 0;

    return { studentId, examId: examId ?? null, totalObtained, totalFull, percentage, marks };
};

/** Student: class highest marks per subject for comparison */
export const getClassHighestMarks = async (studentId: string, examId?: string) => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { classId: true },
    });
    if (!student) throw { status: 404, message: 'Student not found' };

    const publishedExamIds = await prisma.reportCard.findMany({
        where: {
            student: { classId: student.classId },
            status: ResultStatus.PUBLISHED,
            ...(examId && { examId }),
        },
        select: { examId: true },
        distinct: ['examId'],
    }).then((rows) => rows.map((r) => r.examId));

    if (!publishedExamIds.length) {
        return [];
    }

    const marks = await prisma.mark.findMany({
        where: {
            examId: { in: publishedExamIds },
            student: { classId: student.classId },
        },
        select: {
            examId: true,
            subjectId: true,
            marksObtained: true,
            exam: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true, fullMarks: true } },
        },
    });

    const highestByExamSubject = new Map<string, {
        examId: string;
        examName: string;
        subjectId: string;
        subjectName: string;
        fullMarks: number;
        highestMark: number;
    }>();

    for (const mark of marks) {
        const key = `${mark.examId}:${mark.subjectId}`;
        const existing = highestByExamSubject.get(key);
        if (!existing || mark.marksObtained > existing.highestMark) {
            highestByExamSubject.set(key, {
                examId: mark.exam.id,
                examName: mark.exam.name,
                subjectId: mark.subject.id,
                subjectName: mark.subject.name,
                fullMarks: mark.subject.fullMarks,
                highestMark: mark.marksObtained,
            });
        }
    }

    return Array.from(highestByExamSubject.values()).sort((a, b) => {
        if (a.examId !== b.examId) return a.examName.localeCompare(b.examName);
        return a.subjectName.localeCompare(b.subjectName);
    });
};

/** Staff-only (Exam Controller / School Admin / Teacher) — full, unfiltered view for review before publishing. */
export const getResultByExam = async (examId: string) => {
    const marks = await prisma.mark.findMany({
        where: { examId },
        include: { student: true, subject: true },
    });

    const grouped = new Map<
        string,
        {
            student: (typeof marks)[number]["student"];
            marks: Array<{
                id: string; subjectId: string; subjectName: string;
                marksObtained: number; fullMarks: number; passMarks: number;
                grade: string | null; gpa: number | null;
            }>;
            totalMarks: number;
            fullMarks: number;
            isPassed: boolean;
        }
    >();

    for (const mark of marks) {
        const current = grouped.get(mark.studentId);
        const pass = mark.marksObtained >= mark.subject.passMarks;
        const markEntry = {
            id: mark.id,
            subjectId: mark.subjectId,
            subjectName: mark.subject.name,
            marksObtained: mark.marksObtained,
            fullMarks: mark.subject.fullMarks,
            passMarks: mark.subject.passMarks,
            grade: mark.grade,
            gpa: mark.gpa,
        };

        if (!current) {
            grouped.set(mark.studentId, {
                student: mark.student,
                marks: [markEntry],
                totalMarks: mark.marksObtained,
                fullMarks: mark.subject.fullMarks,
                isPassed: pass,
            });
            continue;
        }

        current.marks.push(markEntry);
        current.totalMarks += mark.marksObtained;
        current.fullMarks += mark.subject.fullMarks;
        current.isPassed = current.isPassed && pass;
    }

    const results = Array.from(grouped.values())
        .map((item) => {
            const percentage = item.fullMarks > 0 ? Math.round((item.totalMarks / item.fullMarks) * 100) : 0;
            const gpas = item.marks.filter((m) => m.gpa != null).map((m) => m.gpa as number);
            const avgGpa = gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : null;
            const worstGrade = item.marks.reduce((min, m) => ((m.gpa ?? 0) < (min.gpa ?? Infinity) ? m : min)).grade ?? null;
            return {
                student: item.student,
                marks: item.marks,
                totalMarks: item.totalMarks,
                fullMarks: item.fullMarks,
                percentage,
                grade: worstGrade,
                gpa: avgGpa,
                isPassed: item.isPassed,
            };
        })
        .sort((a, b) => (b.gpa ?? 0) - (a.gpa ?? 0));

    const total = results.length;
    const passed = results.filter((r) => r.isPassed).length;
    const failedCount = total - passed;
    const avgGpa = total > 0 ? Number((results.reduce((sum, r) => sum + (r.gpa ?? 0), 0) / total).toFixed(2)) : 0;

    return { results, summary: { total, passed, failed: failedCount, avgGpa } };
};

export const updateMark = async (id: string, dto: UpdateMarkDto, actorUserId?: string) => {
    const mark = await prisma.mark.findUnique({
        where: { id },
        include: { subject: { select: { fullMarks: true } } },
    });
    if (!mark) throw { status: 404, message: "Mark record not found" };

    if (dto.marksObtained < 0 || dto.marksObtained > mark.subject.fullMarks) {
        throw { status: 400, message: "Marks exceed full marks" };
    }

    const gradingRules = await loadGradingRules();
    const { grade, gpa } = resolveGrade(dto.marksObtained, mark.subject.fullMarks, gradingRules);

    const updated = await prisma.mark.update({
        where: { id },
        data: { marksObtained: dto.marksObtained, grade, gpa },
    });

    const summary = await recalculateAndSaveReportCard(updated.studentId, updated.examId, gradingRules);

    if (actorUserId) {
        await prisma.auditLog.create({
            data: {
                userId: actorUserId,
                action: 'RESULT_MARK_EDITED',
                targetId: id,
                meta: { from: mark.marksObtained, to: dto.marksObtained },
                timestamp: new Date(),
            },
        }).catch((err) => console.warn('Audit log failed:', err?.message));
    }

    return { mark: updated, summary };
};

/** Staff-only — pre-publish review, not gated by publish status. */
export const getFailedStudents = async (examId: string) => {
    const marks = await prisma.mark.findMany({
        where: { examId },
        include: { student: true, subject: { select: { id: true, name: true, passMarks: true } } },
    });

    const grouped = new Map<
        string,
        { student: (typeof marks)[number]["student"]; marks: Array<{ id: string; subjectId: string; subjectName: string; marksObtained: number; passMarks: number }> }
    >();

    for (const mark of marks) {
        if (mark.marksObtained >= mark.subject.passMarks) continue;

        const current = grouped.get(mark.studentId);
        const markEntry = {
            id: mark.id,
            subjectId: mark.subject.id,
            subjectName: mark.subject.name,
            marksObtained: mark.marksObtained,
            passMarks: mark.subject.passMarks,
        };

        if (!current) {
            grouped.set(mark.studentId, { student: mark.student, marks: [markEntry] });
            continue;
        }
        current.marks.push(markEntry);
    }

    return Array.from(grouped.values());
};
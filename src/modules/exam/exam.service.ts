import { Prisma } from "@prisma/client";
import { ExamType, ResultStatus } from "../../generated/prisma/enums";
import prisma from "../../config/db";
import {
    CreateExamDto,
    CreateExamScheduleDto,
    SubmitExamMarksDto,
    UpdateExamDto,
} from "./exam.dto";

function mapExamType(type?: 'CLASS_TEST' | 'MID_TERM' | 'FINAL'): ExamType | undefined {
    if (!type) return undefined;
    return type === 'FINAL' ? 'FINAL_EXAM' : type;
}

export const createExam = async (dto: CreateExamDto) => {
    const examType: ExamType = mapExamType(dto.type) ?? 'CLASS_TEST';

    const rawDate = dto.startDate ?? (dto as unknown as { date?: string }).date;
    const parsedDate = rawDate ? new Date(rawDate) : new Date();
    const createdAt = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    // NOTE: `createdAt` is being repurposed to hold the exam's intended
    // start date since Exam has no dedicated date field of its own. This
    // works but muddies "when was this record actually created" for any
    // future audit/reporting that assumes createdAt is a true timestamp.
    // If you want a cleaner model later, add an explicit `startDate` field
    // to Exam — flagging this now rather than silently changing your schema.

    const existing = await prisma.exam.findFirst({
        where: { name: dto.name, type: examType },
    });
    if (existing) {
        throw { status: 409, message: "Exam with this name and type already exists" };
    }

    return prisma.exam.create({
        data: {
            name: dto.name,
            type: examType,
            createdAt,
            schedules: {
                create: [{
                    classId: dto.classId,
                    subjectId: dto.subjectId,
                    examDate: createdAt,
                    startTime: dto.startTime,
                    endTime: dto.endTime,
                }],
            },
            totalMarks: dto.totalMarks,
        },
        include: {
            schedules: { include: { subject: true, class: true } },
        },
    });
};

/**
 * Admin/Exam Controller view — every exam with ALL of its schedules intact.
 * FIX: previously flattened to `schedules[0]`, silently dropping every
 * other class/subject schedule attached to the exam. Kept as full arrays now.
 */
export const getAllExams = async (classId?: string) => {
    const exams = await prisma.exam.findMany({
        where: classId ? { schedules: { some: { classId } } } : undefined,
        include: {
            schedules: {
                where: classId ? { classId } : undefined, // FIX: only this class's schedules when filtered
                include: { subject: true, class: true },
                orderBy: { examDate: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return exams; // full schedules array preserved — no more schedules[0] guessing
};

/**
 * Student/Parent dashboard — "what exams are coming up for my class".
 * FIX target: this is the missing piece your dashboard needs. Returns every
 * subject's schedule for the given class, across all exams, sorted by date —
 * not just one arbitrary schedule per exam.
 */
export const getExamScheduleForClass = async (classId: string) => {
    return prisma.examSchedule.findMany({
        where: { classId },
        include: {
            subject: { select: { id: true, name: true, fullMarks: true } },
            exam: { select: { id: true, name: true, type: true } },
        },
        orderBy: { examDate: 'asc' },
    });
};

export const getExamById = async (id: string) => {
    const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
            schedules: { include: { subject: true, class: true } },
            // FIX: `result` isn't a real relation on Exam — it's `reportCards`.
            // The old field name would throw a Prisma validation error on every call.
            reportCards: { include: { student: true } },
        },
    });
    if (!exam) {
        throw new Error("Exam not found");
    }
    return exam;
};

export const updateExam = async (id: string, dto: UpdateExamDto) => {
    await getExamById(id);
    const examType = mapExamType(dto.type);

    return prisma.exam.update({
        where: { id },
        data: {
            name: dto.name,
            type: examType,
            createdAt: dto.startDate ? new Date(dto.startDate) : undefined,
        },
    });
};

export const deleteExam = async (id: string) => {
    await getExamById(id);
    return prisma.exam.delete({ where: { id } });
};

export const publishExam = async (id: string, actorUserId: string) => {
    await getExamById(id);

    const updated = await prisma.reportCard.updateMany({
        where: { examId: id },
        data: { status: ResultStatus.PUBLISHED },
    });

    // FIX: NFR Auditability — result publish/unpublish must be logged.
    try {
        await prisma.auditLog.create({
            data: {
                userId: actorUserId,
                action: 'EXAM_RESULT_PUBLISH',
                targetId: id,
                meta: { affectedReportCards: updated.count },
                timestamp: new Date(),
            },
        });
    } catch (err) {
        console.warn('Audit log failed:', (err as any)?.message);
    }

    return { examId: id, status: ResultStatus.PUBLISHED, affectedReportCards: updated.count };
};

export const unpublishExam = async (id: string, actorUserId: string) => {
    await getExamById(id);

    const updated = await prisma.reportCard.updateMany({
        where: { examId: id },
        data: { status: ResultStatus.UNPUBLISHED },
    });

    try {
        await prisma.auditLog.create({
            data: {
                userId: actorUserId,
                action: 'EXAM_RESULT_UNPUBLISH',
                targetId: id,
                meta: { affectedReportCards: updated.count },
                timestamp: new Date(),
            },
        });
    } catch (err) {
        console.warn('Audit log failed:', (err as any)?.message);
    }

    return { examId: id, status: ResultStatus.UNPUBLISHED, affectedReportCards: updated.count };
};

export const createExamSchedule = async (dto: CreateExamScheduleDto) => {
    await getExamById(dto.examId);

    const subject = await prisma.subject.findUnique({
        where: { id: dto.subjectId },
        select: { id: true, classId: true },
    });

    if (!subject) {
        throw { status: 404, message: "Subject not found" };
    }
    if (subject.classId !== dto.classId) {
        throw { status: 400, message: "Subject does not belong to the selected class" };
    }

    try {
        return await prisma.examSchedule.create({
            data: {
                examId: dto.examId,
                classId: dto.classId,
                subjectId: dto.subjectId,
                examDate: new Date(dto.date),
                startTime: dto.startTime,
                endTime: dto.endTime,
            },
            include: { subject: true, exam: true, class: true },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw { status: 409, message: "Schedule already exists for this exam, class and subject" };
        }
        throw error;
    }
};

export const getScheduleByExam = async (examId: string) => {
    return prisma.examSchedule.findMany({
        where: { examId },
        include: { subject: true },
        orderBy: { examDate: 'asc' },
    });
};

export const deleteSchedule = async (id: string) => {
    const schedule = await prisma.examSchedule.findUnique({ where: { id } });
    if (!schedule) throw { status: 404, message: 'Schedule not found' };
    return prisma.examSchedule.delete({ where: { id } });
};

type AuthUser = {
    id: string;
    role: string;
};

const resolveGrade = (
    marksObtained: number,
    fullMarks: number,
    rules: { minPercent: number; maxPercent: number; grade: string; gpa: number }[],
) => {
    const percent = fullMarks === 0 ? 0 : (marksObtained / fullMarks) * 100;
    const matchedRule = rules.find((rule) => percent >= rule.minPercent && percent <= rule.maxPercent);

    return { grade: matchedRule?.grade, gpa: matchedRule?.gpa, percent };
};

export const submitExamMarks = async (
    examId: string,
    dto: SubmitExamMarksDto,
    authUser: AuthUser,
) => {
    await getExamById(examId);

    if (!dto.entries?.length) {
        throw { status: 400, message: 'At least one mark entry is required' };
    }

    let teacherIdFromAuth: string | null = null;
    if (authUser.role === 'TEACHER') {
        const teacher = await prisma.teacher.findUnique({
            where: { userId: authUser.id },
            select: { id: true },
        });
        if (!teacher) {
            throw { status: 403, message: 'Teacher profile not found for this user' };
        }
        teacherIdFromAuth = teacher.id;
    }

    // FIX: batch-fetch every student and subject referenced in this
    // submission ONCE, instead of a findUnique per entry inside the loop.
    // A 40-student single-subject submission previously did ~80 round-trips;
    // this does 3 (students, subjects, grading rules) regardless of size.
    const studentIds = [...new Set(dto.entries.map((e) => e.studentId))];
    const subjectIds = [...new Set(dto.entries.map((e) => e.subjectId))];

    const [students, subjects, gradingRules] = await Promise.all([
        prisma.student.findMany({ where: { id: { in: studentIds } }, select: { id: true } }),
        prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, fullMarks: true } }),
        prisma.gradingRule.findMany({
            orderBy: { minPercent: 'asc' },
            select: { minPercent: true, maxPercent: true, grade: true, gpa: true },
        }),
    ]);

    const studentSet = new Set(students.map((s) => s.id));
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    // Validate everything up front so a bad entry fails before any writes.
    for (const entry of dto.entries) {
        if (!studentSet.has(entry.studentId)) {
            throw { status: 404, message: `Student not found: ${entry.studentId}` };
        }
        const subject = subjectMap.get(entry.subjectId);
        if (!subject) {
            throw { status: 404, message: `Subject not found: ${entry.subjectId}` };
        }
        if (entry.marksObtained < 0 || entry.marksObtained > subject.fullMarks) {
            throw {
                status: 400,
                message: `Marks must be between 0 and ${subject.fullMarks} for subject ${entry.subjectId}`,
            };
        }
        const teacherId = teacherIdFromAuth ?? entry.teacherId;
        if (!teacherId) {
            throw {
                status: 400,
                message: `teacherId is required for admin mark entry (student: ${entry.studentId})`,
            };
        }
    }

    // FIX: verify the resolved teacher is actually assigned to each subject
    // being graded — via SubjectAssignment(subjectId, teacherId). Since a
    // Subject row is unique per class already, this also covers "same class"
    // — a teacher assigned to Math for Class 6 can't be tricked into
    // grading Math for Class 7 (different Subject row, different assignment).
    // This applies to both self-submission (role TEACHER) and admin-entered
    // marks that specify a teacherId per entry — an admin can't silently
    // attribute marks to a teacher who was never assigned that subject.
    const requiredPairs = dto.entries.map((entry) => ({
        subjectId: entry.subjectId,
        teacherId: (teacherIdFromAuth ?? entry.teacherId) as string,
    }));
    const uniquePairs = [...new Map(
        requiredPairs.map((p) => [`${p.subjectId}:${p.teacherId}`, p])
    ).values()];

    const assignments = await prisma.subjectAssignment.findMany({
        where: { OR: uniquePairs.map((p) => ({ subjectId: p.subjectId, teacherId: p.teacherId })) },
        select: { subjectId: true, teacherId: true },
    });
    const assignedSet = new Set(assignments.map((a) => `${a.subjectId}:${a.teacherId}`));

    for (const pair of uniquePairs) {
        if (!assignedSet.has(`${pair.subjectId}:${pair.teacherId}`)) {
            throw {
                status: 403,
                message: `Teacher ${pair.teacherId} is not assigned to subject ${pair.subjectId}`,
            };
        }
    }

    const marks = await prisma.$transaction(
        dto.entries.map((entry) => {
            const subject = subjectMap.get(entry.subjectId)!;
            const teacherId = (teacherIdFromAuth ?? entry.teacherId) as string;
            const { grade, gpa } = resolveGrade(entry.marksObtained, subject.fullMarks, gradingRules);

            return prisma.mark.upsert({
                where: {
                    studentId_examId_subjectId: {
                        studentId: entry.studentId,
                        examId,
                        subjectId: entry.subjectId,
                    },
                },
                update: { marksObtained: entry.marksObtained, grade, gpa, teacherId },
                create: {
                    studentId: entry.studentId,
                    examId,
                    subjectId: entry.subjectId,
                    marksObtained: entry.marksObtained,
                    grade,
                    gpa,
                    teacherId,
                },
            });
        })
    );

    return { examId, totalProcessed: marks.length, marks };
};

/**
 * Student/Parent — own published results only.
 * FIX target: gates on ReportCard.status === PUBLISHED so nothing leaks
 * before the Exam Controller publishes it. Pass examId to scope to one
 * exam, or omit to get every published result for this student.
 */
export const getPublishedResultsForStudent = async (studentId: string, examId?: string) => {
    const publishedReportCards = await prisma.reportCard.findMany({
        where: {
            studentId,
            status: ResultStatus.PUBLISHED,
            ...(examId && { examId }),
        },
        include: { exam: { select: { id: true, name: true, type: true } } },
    });

    if (!publishedReportCards.length) return [];

    const publishedExamIds = publishedReportCards.map((rc) => rc.examId);

    const marks = await prisma.mark.findMany({
        where: { studentId, examId: { in: publishedExamIds } },
        include: { subject: { select: { name: true, fullMarks: true, passMarks: true } } },
    });

    return publishedReportCards.map((rc) => ({
        ...rc,
        subjects: marks.filter((m) => m.examId === rc.examId),
    }));
};

export const getFailedStudents = async (examId: string, classId?: string) => {
    await getExamById(examId);

    const allMarks = await prisma.mark.findMany({
        where: {
            examId,
            student: classId ? { section: { classId } } : undefined,
        },
        include: {
            student: {
                select: {
                    id: true,
                    studentId: true,
                    name: true,
                    section: {
                        select: { id: true, name: true, classId: true, class: { select: { name: true } } },
                    },
                },
            },
            subject: { select: { id: true, name: true, passMarks: true } },
        },
    });

    const failedMarks = allMarks.filter((mark) => mark.marksObtained < mark.subject.passMarks);

    const grouped = new Map<string, {
        student: (typeof failedMarks)[number]['student'];
        failedSubjects: Array<{ subjectId: string; subjectName: string; marksObtained: number; passMarks: number }>;
    }>();

    for (const mark of failedMarks) {
        const existing = grouped.get(mark.student.id);
        const failedSubject = {
            subjectId: mark.subject.id,
            subjectName: mark.subject.name,
            marksObtained: mark.marksObtained,
            passMarks: mark.subject.passMarks,
        };
        if (existing) {
            existing.failedSubjects.push(failedSubject);
            continue;
        }
        grouped.set(mark.student.id, { student: mark.student, failedSubjects: [failedSubject] });
    }

    return {
        examId,
        classId: classId ?? null,
        totalFailedStudents: grouped.size,
        students: Array.from(grouped.values()),
    };
};
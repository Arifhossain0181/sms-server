import { Prisma } from "@prisma/client";
import { ExamType, ResultStatus } from "../../generated/prisma/enums";
import prisma from "../../config/db";
import {
    CreateExamDto,
    CreateExamScheduleDto,
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

export const getAllExams = async (classId?: string) => {
    const exams = await prisma.exam.findMany({
        where: classId ? { schedules: { some: { classId } } } : undefined,
        include: {
            schedules: {
                where: classId ? { classId } : undefined,
                include: { subject: true, class: true },
                orderBy: { examDate: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return exams;
};

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
    await prisma.examSchedule.deleteMany({ where: { examId: id } });
    await prisma.mark.deleteMany({ where: { examId: id } });
    await prisma.admitCard.deleteMany({ where: { examId: id } });
    await prisma.reportCard.deleteMany({ where: { examId: id } });
    return prisma.exam.delete({ where: { id } });
};

export const publishExam = async (id: string, actorUserId: string) => {
    await getExamById(id);

    const pendingCount = await prisma.mark.count({ where: { examId: id, status: 'SUBMITTED' } });
    if (pendingCount > 0) {
        throw {
            status: 400,
            message: `Cannot publish: ${pendingCount} mark entr${pendingCount === 1 ? 'y' : 'ies'} still pending Exam Controller review`,
        };
    }

    const reportCardCount = await prisma.reportCard.count({ where: { examId: id } });
    if (reportCardCount === 0) {
        throw { status: 400, message: 'Cannot publish: no approved marks / report cards exist for this exam' };
    }

    const updated = await prisma.reportCard.updateMany({
        where: { examId: id },
        data: { status: ResultStatus.PUBLISHED },
    });

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

export const getAdmitCardData = async (examId: string, studentId: string) => {
    const exam = await getExamById(examId);

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            studentId: true,
            name: true,
            rollNumber: true,
            section: {
                select: {
                    id: true,
                    name: true,
                    classId: true,
                    class: { select: { id: true, name: true } },
                },
            },
        },
    });

    if (!student) {
        throw { status: 404, message: 'Student not found' };
    }
    if (!student.section) {
        throw { status: 400, message: 'Student is not assigned to a section/class' };
    }

    const schedules = await prisma.examSchedule.findMany({
        where: { examId, classId: student.section.classId },
        include: { subject: { select: { id: true, name: true, fullMarks: true } } },
        orderBy: { examDate: 'asc' },
    });

    if (!schedules.length) {
        throw {
            status: 400,
            message: 'No exam schedule found for this student\'s class under this exam',
        };
    }

    return {
        exam: { id: exam.id, name: exam.name, type: exam.type },
        student: {
            id: student.id,
            studentId: student.studentId,
            name: student.name,
            rollNumber: student.rollNumber,
            className: student.section.class.name,
            sectionName: student.section.name,
        },
        schedules: schedules.map((s) => ({
            subjectName: s.subject.name,
            fullMarks: s.subject.fullMarks,
            examDate: s.examDate,
            startTime: s.startTime,
            endTime: s.endTime,
        })),
    };
};

export const getAdmitCardDataForClass = async (examId: string, classId: string) => {
    await getExamById(examId);

    const students = await prisma.student.findMany({
        where: { section: { classId } },
        select: { id: true },
    });

    if (!students.length) {
        throw { status: 404, message: 'No students found in this class' };
    }

    const results = [];
    for (const s of students) {
        results.push(await getAdmitCardData(examId, s.id));
    }
    return results;
};

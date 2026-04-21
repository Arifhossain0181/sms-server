"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFailedStudents = exports.submitExamMarks = exports.deleteSchedule = exports.getScheduleByExam = exports.createExamSchedule = exports.unpublishExam = exports.publishExam = exports.deleteExam = exports.updateExam = exports.getExamById = exports.getAllExams = exports.createExam = void 0;
const client_1 = require("@prisma/client");
const enums_1 = require("../../generated/prisma/enums");
const db_1 = __importDefault(require("../../config/db"));
const createExam = async (dto) => {
    const examType = dto.type === 'FINAL' ? 'FINAL_EXAM' : dto.type;
    const existing = await db_1.default.exam.findFirst({
        where: {
            name: dto.name,
            type: examType,
        },
    });
    if (existing) {
        throw { status: 409, message: "Exam with this name and type already exists" };
    }
    return await db_1.default.exam.create({
        data: {
            name: dto.name,
            type: examType,
            createdAt: new Date(dto.startDate),
        }
    });
};
exports.createExam = createExam;
const getAllExams = async (classId) => {
    return await db_1.default.exam.findMany({
        where: classId ? { schedules: { some: { classId } } } : undefined,
        include: {
            schedules: {
                include: {
                    subject: true,
                    class: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};
exports.getAllExams = getAllExams;
const getExamById = async (id) => {
    const exam = await db_1.default.exam.findUnique({
        where: { id },
        include: {
            schedules: {
                include: {
                    subject: true,
                    class: true
                }
            },
            result: {
                include: {
                    student: true
                }
            }
        }
    });
    if (!exam) {
        throw new Error("Exam not found");
    }
    return exam;
};
exports.getExamById = getExamById;
const updateExam = async (id, dto) => {
    await (0, exports.getExamById)(id);
    const examType = dto.type
        ? (dto.type === 'FINAL' ? 'FINAL_EXAM' : dto.type)
        : undefined;
    return await db_1.default.exam.update({
        where: { id },
        data: {
            name: dto.name,
            type: examType,
            createdAt: dto.startDate ? new Date(dto.startDate) : undefined,
        }
    });
};
exports.updateExam = updateExam;
const deleteExam = async (id) => {
    await (0, exports.getExamById)(id);
    return await db_1.default.exam.delete({ where: { id } });
};
exports.deleteExam = deleteExam;
const publishExam = async (id) => {
    await (0, exports.getExamById)(id);
    const updated = await db_1.default.reportCard.updateMany({
        where: { examId: id },
        data: { status: enums_1.ResultStatus.PUBLISHED },
    });
    return {
        examId: id,
        status: enums_1.ResultStatus.PUBLISHED,
        affectedReportCards: updated.count,
    };
};
exports.publishExam = publishExam;
const unpublishExam = async (id) => {
    await (0, exports.getExamById)(id);
    const updated = await db_1.default.reportCard.updateMany({
        where: { examId: id },
        data: { status: enums_1.ResultStatus.UNPUBLISHED },
    });
    return {
        examId: id,
        status: enums_1.ResultStatus.UNPUBLISHED,
        affectedReportCards: updated.count,
    };
};
exports.unpublishExam = unpublishExam;
const createExamSchedule = async (dto) => {
    await (0, exports.getExamById)(dto.examId);
    const subject = await db_1.default.subject.findUnique({
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
        return await db_1.default.examSchedule.create({
            data: {
                examId: dto.examId,
                classId: dto.classId,
                subjectId: dto.subjectId,
                examDate: new Date(dto.date),
                startTime: dto.startTime,
                endTime: dto.endTime,
            },
            include: {
                subject: true,
                exam: true,
                class: true,
            }
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw { status: 409, message: "Schedule already exists for this exam, class and subject" };
        }
        throw error;
    }
};
exports.createExamSchedule = createExamSchedule;
const getScheduleByExam = async (examId) => {
    return await db_1.default.examSchedule.findMany({
        where: { examId },
        include: { subject: true },
        orderBy: { examDate: 'asc' },
    });
};
exports.getScheduleByExam = getScheduleByExam;
const deleteSchedule = async (id) => {
    const schedule = await db_1.default.examSchedule.findUnique({ where: { id } });
    if (!schedule)
        throw { status: 404, message: 'Schedule not found' };
    return await db_1.default.examSchedule.delete({ where: { id } });
};
exports.deleteSchedule = deleteSchedule;
const resolveGrade = (marksObtained, fullMarks, rules) => {
    const percent = fullMarks === 0 ? 0 : (marksObtained / fullMarks) * 100;
    const matchedRule = rules.find((rule) => percent >= rule.minPercent && percent <= rule.maxPercent);
    return {
        grade: matchedRule?.grade,
        gpa: matchedRule?.gpa,
        percent,
    };
};
const submitExamMarks = async (examId, dto, authUser) => {
    await (0, exports.getExamById)(examId);
    if (!dto.entries?.length) {
        throw { status: 400, message: 'At least one mark entry is required' };
    }
    let teacherIdFromAuth = null;
    if (authUser.role === 'TEACHER') {
        const teacher = await db_1.default.teacher.findUnique({
            where: { userId: authUser.id },
            select: { id: true },
        });
        if (!teacher) {
            throw { status: 403, message: 'Teacher profile not found for this user' };
        }
        teacherIdFromAuth = teacher.id;
    }
    const gradingRules = await db_1.default.gradingRule.findMany({
        orderBy: { minPercent: 'asc' },
        select: { minPercent: true, maxPercent: true, grade: true, gpa: true },
    });
    const marks = await db_1.default.$transaction(async (tx) => {
        const processed = [];
        for (const entry of dto.entries) {
            const student = await tx.student.findUnique({
                where: { id: entry.studentId },
                select: { id: true },
            });
            if (!student) {
                throw { status: 404, message: `Student not found: ${entry.studentId}` };
            }
            const subject = await tx.subject.findUnique({
                where: { id: entry.subjectId },
                select: { id: true, fullMarks: true },
            });
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
            const { grade, gpa } = resolveGrade(entry.marksObtained, subject.fullMarks, gradingRules);
            const mark = await tx.mark.upsert({
                where: {
                    studentId_examId_subjectId: {
                        studentId: entry.studentId,
                        examId,
                        subjectId: entry.subjectId,
                    },
                },
                update: {
                    marksObtained: entry.marksObtained,
                    grade,
                    gpa,
                    teacherId,
                },
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
            processed.push(mark);
        }
        return processed;
    });
    return {
        examId,
        totalProcessed: marks.length,
        marks,
    };
};
exports.submitExamMarks = submitExamMarks;
const getFailedStudents = async (examId, classId) => {
    await (0, exports.getExamById)(examId);
    const allMarks = await db_1.default.mark.findMany({
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
                        select: {
                            id: true,
                            name: true,
                            classId: true,
                            class: { select: { name: true } },
                        },
                    },
                },
            },
            subject: {
                select: {
                    id: true,
                    name: true,
                    passMarks: true,
                },
            },
        },
    });
    const failedMarks = allMarks.filter((mark) => mark.marksObtained < mark.subject.passMarks);
    const grouped = new Map();
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
        grouped.set(mark.student.id, {
            student: mark.student,
            failedSubjects: [failedSubject],
        });
    }
    return {
        examId,
        classId: classId ?? null,
        totalFailedStudents: grouped.size,
        students: Array.from(grouped.values()),
    };
};
exports.getFailedStudents = getFailedStudents;

import { Prisma } from "@prisma/client";
import { ExamType, ResultStatus } from "../../generated/prisma/enums";
import prisma from "../../config/db";
import {
    CreateExamDto,
    CreateExamScheduleDto,
    SubmitExamMarksDto,
    UpdateExamDto,
} from "./exam.dto";



export const createExam = async(dto:CreateExamDto) =>{
    const examType: ExamType = dto.type === 'FINAL' ? 'FINAL_EXAM' : dto.type;

    const existing = await prisma.exam.findFirst({
        where:{
            name: dto.name,
            type: examType,
        },
    })
    if(existing){
        throw { status: 409, message: "Exam with this name and type already exists" };
    }
    return await prisma.exam.create({
        data:{
            name: dto.name,
            type: examType,
            createdAt: new Date(dto.startDate),
        }
    })
}


export const getAllExams = async(classId?:string) =>{
    return await prisma.exam.findMany({
        where: classId ? { schedules: { some: { classId } } } : undefined,
         include:{
            schedules:{
                include:{
                    subject:true,
                    class:true,
                }}
         },
         orderBy:{
            createdAt: 'desc'
         }
    })
}
export const getExamById = async(id:string) =>{
    const exam = await prisma.exam.findUnique({
        where:{id},
        include:{
             schedules:{
                include:{
                    subject:true,
                    class:true
                }
             },
             result:{
                include:{
                    student:true
                }
             }
        }
    })
    if(!exam){
        throw new Error("Exam not found");
    }
    return exam;
}

export const updateExam = async(id:string, dto:UpdateExamDto) =>{
    await getExamById(id);
    const examType = dto.type
        ? (dto.type === 'FINAL' ? 'FINAL_EXAM' : dto.type)
        : undefined;

    return await prisma.exam.update({
        where:{id},
        data:{
            name: dto.name,
            type: examType,
            createdAt: dto.startDate ? new Date(dto.startDate) : undefined,
        }
    })
}
export const deleteExam = async (id: string) => {
  await getExamById(id);
  return await prisma.exam.delete({ where: { id } });
};
export const publishExam = async (id: string) => {
    await getExamById(id);

    const updated = await prisma.reportCard.updateMany({
        where: { examId: id },
        data: { status: ResultStatus.PUBLISHED },
    });

    return {
        examId: id,
        status: ResultStatus.PUBLISHED,
        affectedReportCards: updated.count,
    };
};
export const unpublishExam = async (id: string) => {
    await getExamById(id);

    const updated = await prisma.reportCard.updateMany({
        where: { examId: id },
        data: { status: ResultStatus.UNPUBLISHED },
    });

    return {
        examId: id,
        status: ResultStatus.UNPUBLISHED,
        affectedReportCards: updated.count,
    };
};

export const createExamSchedule = async(dto:CreateExamScheduleDto) =>{
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
            data:{
                examId: dto.examId,
                classId: dto.classId,
                subjectId: dto.subjectId,
                examDate: new Date(dto.date),
                startTime: dto.startTime,
                endTime: dto.endTime,
            },
            include:{
                subject:true,
                exam:true,
                class: true,
            }
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw { status: 409, message: "Schedule already exists for this exam, class and subject" };
        }
        throw error;
    }
}

export const getScheduleByExam = async (examId: string) => {
  return await prisma.examSchedule.findMany({
    where: { examId },
    include: { subject: true },
        orderBy: { examDate: 'asc' },
  });
};

export const deleteSchedule = async (id: string) => {
  const schedule = await prisma.examSchedule.findUnique({ where: { id } });
  if (!schedule) throw { status: 404, message: 'Schedule not found' };
  return await prisma.examSchedule.delete({ where: { id } });
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

    return {
        grade: matchedRule?.grade,
        gpa: matchedRule?.gpa,
        percent,
    };
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

    const gradingRules = await prisma.gradingRule.findMany({
        orderBy: { minPercent: 'asc' },
        select: { minPercent: true, maxPercent: true, grade: true, gpa: true },
    });

    const marks = await prisma.$transaction(async (tx) => {
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

    const grouped = new Map<string, {
        student: (typeof failedMarks)[number]['student'];
        failedSubjects: Array<{
            subjectId: string;
            subjectName: string;
            marksObtained: number;
            passMarks: number;
        }>;
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



import { CreateSubjectDto, UpdateSubjectDto } from "./subject.dto";
import prisma from "../../config/db";

function assertValidMarks(fullMarks?: number, passMarks?: number) {
    if (fullMarks !== undefined && passMarks !== undefined && passMarks > fullMarks) {
        throw { status: 400, message: "passMarks cannot be greater than fullMarks" };
    }
}


function isDuplicateConstraintError(err: any) {
    return err?.code === "P2002";
}

export const createSubject = async (dto: CreateSubjectDto) => {
    assertValidMarks(dto.fullMarks, dto.passMarks);

    const [classExists, existingName, existingCode] = await Promise.all([
        prisma.class.findUnique({ where: { id: dto.classId }, select: { id: true } }),
        prisma.subject.findFirst({ where: { name: dto.name, classId: dto.classId }, select: { id: true } }),
        prisma.subject.findFirst({ where: { code: dto.code, classId: dto.classId }, select: { id: true } }),
    ]);

    if (!classExists) throw { status: 404, message: "Class not found" };
    if (existingName) throw { status: 409, message: "Subject with this name already exists in this class" };
    if (existingCode) throw { status: 409, message: "Subject with this code already exists in this class" };

    if (dto.teacherId) {
        const teacherExists = await prisma.teacher.findUnique({ where: { id: dto.teacherId }, select: { id: true } });
        if (!teacherExists) throw { status: 404, message: "Teacher not found" };
    }

    const { teacherId, isOptional, classId, ...rest } = dto;

    try {
        return await prisma.subject.create({
            data: {
                ...rest,
                isCompulsory: typeof isOptional === "boolean" ? !isOptional : true,
                class: { connect: { id: classId } },
                assignments: teacherId
                    ? {
                          create: {
                              teacher: { connect: { id: teacherId } },
                          },
                      }
                    : undefined,
            },
            include: {
                class: true,
                assignments: {
                    include: {
                        teacher: true,
                    },
                },
            }
        });
    } catch (err) {
        if (isDuplicateConstraintError(err)) {
            throw { status: 409, message: "Subject with this name or code already exists in this class" };
        }
        throw err;
    }
}

export const getAllSubjects = async (classId?: string) => {
    return await prisma.subject.findMany({
        where: classId ? { classId } : {},
        include: {
            class: true,
            assignments: {
                include: {
                    teacher: true,
                },
            },
        },
        orderBy: {
            name: 'asc'
        }
    })
}

export const getSubjectById = async (id: string) => {
    const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
            class: true,
            assignments: {
                include: {
                    teacher: true,
                },
            },
        },
    });
    if (!subject) throw { status: 404, message: 'Subject not found' };
    return subject;
};

export const updateSubject = async (id: string, dto: UpdateSubjectDto) => {
    const current = await getSubjectById(id);

    assertValidMarks(
        dto.fullMarks ?? current.fullMarks,
        dto.passMarks ?? current.passMarks
    );

    // FIX: createSubject checked for a duplicate name before writing;
    // updateSubject never did, so renaming a subject into collision with
    // another subject in the same class used to surface a raw P2002.
    if (dto.name && dto.name !== current.name) {
        const existingName = await prisma.subject.findFirst({
            where: { name: dto.name, classId: current.classId, NOT: { id } },
            select: { id: true },
        });
        if (existingName) throw { status: 409, message: "Subject with this name already exists in this class" };
    }

    if (dto.code && dto.code !== current.code) {
        const existingCode = await prisma.subject.findFirst({
            where: { code: dto.code, classId: current.classId, NOT: { id } },
            select: { id: true },
        });
        if (existingCode) throw { status: 409, message: "Subject with this code already exists in this class" };
    }

    if (dto.teacherId) {
        const teacherExists = await prisma.teacher.findUnique({ where: { id: dto.teacherId }, select: { id: true } });
        if (!teacherExists) throw { status: 404, message: "Teacher not found" };
    }

    const { teacherId, isOptional, ...rest } = dto;

    try {
        return await prisma.subject.update({
            where: { id },
            data: {
                ...rest,
                isCompulsory: typeof isOptional === 'boolean' ? !isOptional : undefined,
                assignments: teacherId
                    ? {
                          upsert: {
                              where: { subjectId_teacherId: { subjectId: id, teacherId } },
                              update: {},
                              create: {
                                  teacher: { connect: { id: teacherId } },
                              },
                          },
                      }
                    : undefined,
            },
            include: {
                class: true,
                assignments: {
                    include: {
                        teacher: true,
                    },
                },
            },
        });
    } catch (err) {
        if (isDuplicateConstraintError(err)) {
            throw { status: 409, message: "Subject with this name or code already exists in this class" };
        }
        throw err;
    }
};

export const deleteSubject = async (id: string) => {
    await getSubjectById(id);
    return await prisma.subject.delete({ where: { id } });
};


export const assignTeacher = async (subjectId: string, teacherId: string) => {
    await getSubjectById(subjectId);

    const teacherExists = await prisma.teacher.findUnique({ where: { id: teacherId }, select: { id: true } });
    if (!teacherExists) throw { status: 404, message: "Teacher not found" };

    await prisma.$transaction([
        prisma.subjectAssignment.deleteMany({
            where: { subjectId, NOT: { teacherId } },
        }),
        prisma.subjectAssignment.upsert({
            where: { subjectId_teacherId: { subjectId, teacherId } },
            update: {},
            create: {
                subject: { connect: { id: subjectId } },
                teacher: { connect: { id: teacherId } },
            },
        }),
    ]);

    return await getSubjectById(subjectId);
};

// NEW: assignTeacher (above) replaces the current teacher, but there was
// no way to clear a subject back to "no teacher assigned" at all.
export const unassignTeacher = async (subjectId: string) => {
    await getSubjectById(subjectId);
    await prisma.subjectAssignment.deleteMany({ where: { subjectId } });
    return await getSubjectById(subjectId);
};

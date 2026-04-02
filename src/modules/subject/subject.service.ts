import { CreateSubjectDto, UpdateSubjectDto } from "./subject.dto";
import prisma from "../../config/db";



export const createSubject = async (dto: CreateSubjectDto) => {
    const existing = await prisma.subject.findFirst({
        where: {
            name: dto.name,
            classId: dto.classId
        }
    })
    if(existing){
        throw new Error("Subject with this name already exists in this class");
    }
    const { teacherId, code: _code, isOptional, classId, ...rest } = dto;
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
    })
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
            orderBy:{
                name:'asc'
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
  await getSubjectById(id);
  const { teacherId, code: _code, isOptional, ...rest } = dto;
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
};

export const deleteSubject = async (id: string) => {
  await getSubjectById(id);
  return await prisma.subject.delete({ where: { id } });
};

export const assignTeacher = async (subjectId: string, teacherId: string) => {
  await getSubjectById(subjectId);
  await prisma.subjectAssignment.upsert({
    where: { subjectId_teacherId: { subjectId, teacherId } },
    update: {},
    create: {
      subject: { connect: { id: subjectId } },
      teacher: { connect: { id: teacherId } },
    },
  });

  return await getSubjectById(subjectId);
};
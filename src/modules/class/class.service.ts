import prisma from "../../config/db";
import { CreateClassDto, CreateSectionDto, UpdateClassDto, UpdateSectionDto } from "./class.dto";


export const createClass = async (dto:CreateClassDto) =>{
    const existing = await prisma.class.findUnique({
        where: {
            name: dto.name
        }
    })
    if(existing){
        throw new Error("Class with this name already exists");
    }
    return await prisma.class.create({
        data: {
            name: dto.name,
            numericLevel: dto.numericLevel
        }
    })
}
export const getAllClasses = async () =>{
    return await prisma.class.findMany({
        include:{
            sections:{
                include:{
                    classTeacher: true
                },
                _count:{
                    select:{
                        students: true
                    },
                    orderBy:{
                        name: 'asc'
                    }
                }
            }
        }
    })
}

export const getClassById = async (id:string) =>{
    const cls = await prisma.class.findUnique({
        where: {
            id
        },
        include:{
            sections:{
                include:{
                    classTeacher: true
                },
                _count:{
                    select:{
                        students: true
                    },
                    orderBy:{
                        name: 'asc'
                    }

                }
            }
        }
    })
    if(!cls){
        throw new Error("Class not found");
    }
    return cls;

}

export const updateClass = async(id:string, dto:UpdateClassDto) =>{
    await getClassById(id);
    return await prisma.class.update({
        where: {
            id
        },
        data: {
            name: dto.name,
            numericLevel: dto.numericLevel
        }
    })
}
export const deleteClass = async (id:string) =>{
    await getClassById(id);
    return await prisma.class.delete({
        where: {
            id
        }
    })
}

// create section  

export const createSection = async (dto:CreateSectionDto) =>{
    const existing = await prisma.section.findFirst({
        where: {
            name: dto.name,
            classId: dto.classId}
    })
    if(existing){
        throw new Error("Section with this name already exists in this class");
    }
    return await prisma.section.create({
        data: dto,
        include:{
            class:true,
        }
    })
} 

export const  getSectionsByClass = async (classId: string) => {
  return await prisma.section.findMany({
    where: { classId },
    include: {
      classTeacher: true,
      _count: { select: { students: true } },
    },
  });
};

export const updateSection = async (id: string, dto: UpdateSectionDto) => {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) throw { status: 404, message: 'Section not found' };
  return await prisma.section.update({ where: { id }, data: dto });
};

export const deleteSection = async (id: string) => {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) throw { status: 404, message: 'Section not found' };
  return await prisma.section.delete({ where: { id } });
};
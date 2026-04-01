
import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './student.dto';
import prisma from '../../config/db';
import bcrypt from 'bcryptjs';

const paginate = async (
    model: { count: (args: { where: any }) => Promise<number> },
    where: any,
    page: number,
    limit: number
) => {
    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit;
    const skip = (safePage - 1) * safeLimit;
    const take = safeLimit;
    const total = await model.count({ where });

    return {
        skip,
        take,
        meta: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit)
        }
    };
};


export class StudentService {

    async createStudent(dto: CreateStudentDto) {
        const rollNumber = Number(dto.rollNumber);
        if (!Number.isInteger(rollNumber)) {
            throw new Error("Roll number must be a valid number");
        }

        const emailExists = await prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (emailExists) {
            throw new Error("Email already exists");
        }
        const rollexists = await prisma.student.findFirst({
            where: {
                rollNumber
            }
        });
        if (rollexists) {
            throw new Error("Roll number already exists");
        }
        const classExists = await prisma.class.findUnique({
            where: {
                id: dto.classId
            }
        });
        if (!classExists) {
            throw new Error("Class not found");
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const student = await prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: hashedPassword,
                role: 'STUDENT',
                student: {
                    create: {
                        rollNumber,
            classId: dto.classId,
            dateOfBirth: new Date(dto.dateOfBirth),
            gender: dto.gender,
            bloodGroup: dto.bloodGroup,
            phone: dto.phoneNumber,
            address: dto.address,
            avatarUrl: dto.avatarUrl,
            guardianName: dto.guardianName,
            guardianPhone: dto.guardianPhone,
            guardianEmail: dto.guardianEmail,
            guardianRelation: dto.guradianRelation,
                    }
                }
            },
            select: {
                id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        student: true,
            }
        })
        return student;

    }

    async findAllStudents(query:StudentQueryDto) {
         const { page = '1', limit = '10', search, classId, gender } = query; 
         const where :any ={
            ...(classId && { student: { classId } }),
            ...(gender && { student: { gender } }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { student: { rollNumber: isNaN(Number(search)) ? undefined : Number(search) } }
                ]
            })
        }; 
        const {skip, take ,meta} = await   paginate(
            prisma.student,
      where,
      parseInt(page),
      parseInt(limit)
    );
        const students = await prisma.student.findMany({
            where,
            skip,
            take,
            include:{
                user:{

                    select:{
                        id:true,
                        name:true,
                        email:true,
                        role:true,
                        isActive:true,
                        createdAt:true
                    }
                },
                class:{
                    select:{
                        id:true,
                        name:true,
                        section:true
                    }
                }
            },
            orderBy:{
                createdAt:'desc'
            }
        })
        
        return {
            data:students,
            meta
        };
    }
    async findStudentById(id:string) {
        const student = await prisma.student.findUnique({
            where: {
                id
            },
            include:{
                user:{
                    select:{
                        id:true,
                        name:true,
                        email:true,
                        role:true,
                        isActive:true,
                        createdAt:true
                    }
                },
                class:{
                    select:{
                        id:true,
                        name:true,
                        section:true
                    }
                },
                attendance:{
                    take:10 ,
                    orderBy:{
                        date:'desc'}
                },
                results:{
                    include:{
                        exam:{
                            select:{
                                title:true,
                            }
                        },
                        subject:{
                            select:{
                                name:true,
                              }  }
                },
                take:10,
                orderBy:{
                    createdAt:'desc'}
            },
            fees:{
                take:5,
                orderBy:{
                    dueDate:'desc'}
            }}
        })
        if(!student) {
            throw new Error("Student not found");
        }


        return student;
    }
    async findStudentByUserId(userId:string) {
        const student = await prisma.student.findUnique({
            where: {
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                        createdAt: true
                    }
                },
                section: {
                    select: {
                        id: true,
                        name: true,
                        class: true
                    }
                }
            }
        });

        if (!student) {
            throw new Error("Student not found");
        }

        return student;
    }
    async update(id:string ,dto:UpdateStudentDto){
        const student = await prisma.student.findUnique({
            where:{
                id
            }
        })
        if(!student) {
            throw new Error("Student not found");
        }
        if(dto.classId){
            const classExists = await prisma.class.findUnique({
                where:{
                    id: dto.classId
                }
            })
            if(!classExists) {
                throw new Error("Class not found");
            }
        }
        const {name, bloodGroup, ...studentFields} = dto;

        const updatedStudent = await prisma.student.update({
            where:{
                id
            },
            data:{
                ...studentFields,
                ...(bloodGroup !== undefined && { bloodGroup: bloodGroup as any }),
                ...(name && {
                    user:{
                        update:{
                            name
                        }
                    }
                })
            },
            include:{
                user:{
                    select:{
                        id:true,
                        name:true,
                        email:true
                    }
                },
                section:{
                    select:{
                        id:true,
                        name:true,
                        class:true
                    }
                }
            }
        })
        return updatedStudent;
    }
  async delete(id:string){
        const student = await prisma.student.findUnique({
            where:{
                id
            }
        })
        if(!student) {
            throw new Error("Student not found");
        }
        await prisma.user.delete({
            where:{
                id:student.userId
            }
        })
  }
  async uploadAvatar(studentId:string, avatarUrl:string){
    const student = await prisma.student.findUnique({
        where:{ 
            id: studentId
        }
    })
    if(!student) {
        throw new Error("Student not found");
    }
    return await prisma.student.update({
        where:{
            id: studentId
        },
        data:{
            photo: avatarUrl
        },
    })
    


  }
  async getAttendance(studentId:string){
    const [total, present ,absent ,late] = await Promise.all([
        prisma.studentAttendance.count({
            where:{
                studentId
            }
        })
        ,        prisma.studentAttendance.count({
            where:{
                studentId,
                status: 'PRESENT'
            }
        })
        ,        prisma.studentAttendance.count({
            where:{
                studentId,
                status: 'ABSENT'
            }
        })
        ,        prisma.studentAttendance.count({
            where:{
                studentId,
                status: 'LATE'
            }
        })

    ]) 
    const Parcentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
        total,
        present,
        absent,
        late,
        percentage: Parcentage
    }

  }
  async getResults(studentId:string){
    const results = await prisma.mark.findMany({
        where:{
            studentId
        },
        include:{
            exam:{
                select:{
                    name:true
                }
            },
            subject:{
                select:{
                    name:true
                }
            }

        }
    })
    const totalObtained = results.reduce((sum: number, r) => sum + r.marksObtained, 0);
        const totalPossible = results.length * 100;
    const percentage = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;
    return { results, totalObtained, totalPossible, percentage };
  }

}
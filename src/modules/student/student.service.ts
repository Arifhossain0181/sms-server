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

    private notFound(message: string) {
        return Object.assign(new Error(message), { status: 404 });
    }

    async createStudent(dto: CreateStudentDto) {
        const rollNumber = Number(dto.rollNumber);
        if (!Number.isInteger(rollNumber)) {
            throw new Error("Roll number must be a valid number");
        }

        // Check email only if provided
        if (dto.email) {
            const emailExists = await prisma.user.findUnique({
                where: {
                    email: dto.email
                }
            });
            if (emailExists) {
                throw new Error("Email already exists");
            }
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
        // Hash password only if provided
        const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : '';
        
        // Generate unique studentId
        const studentId = `STU-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        
        // Get a section from the class (assuming each class has at least one section)
        const section = await prisma.section.findFirst({
            where: {
                classId: dto.classId
            }
        });
        if (!section) {
            throw new Error("No section found for this class");
        }

        // Create student with optional parent/guardian
        const genderMap = { 'Male': 'MALE', 'Female': 'FEMALE', 'Other': 'OTHER' };
        const student = await prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email || `student-${Date.now()}@school.local`, // Generate temp email if not provided
                passwordHash: hashedPassword,
                role: 'STUDENT',
                studentProfile: {
                    create: {
                        studentId,
                        rollNumber,
                        sectionId: section.id,
                        classId: dto.classId,
                        dob: new Date(dto.dateOfBirth),
                        gender: genderMap[dto.gender as keyof typeof genderMap] as any,
                        bloodGroup: dto.bloodGroup as any,
                        photo: dto.avatarUrl,
                        address: dto.address,
                        name: dto.name,
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                studentProfile: {
                    select: {
                        id: true,
                        studentId: true,
                        rollNumber: true,
                        classId: true,
                        sectionId: true,
                        dob: true,
                        gender: true,
                        bloodGroup: true,
                        photo: true,
                        address: true,
                        name: true,
                    }
                },
            }
        });
        
        // Create parent/guardian record if guardian info is provided
        if (dto.guardianName && dto.guardianEmail) {
            const parentUser = await prisma.user.create({
                data: {
                    name: dto.guardianName,
                    email: dto.guardianEmail,
                    passwordHash: await bcrypt.hash(Math.random().toString(36), 10), // Random password for guardian
                    role: 'PARENT'
                }
            });
            
            const parentRecord = await prisma.parent.create({
                data: {
                    userId: parentUser.id,
                    name: dto.guardianName,
                    phone: dto.guardianPhone || '',
                }
            });
            
            // Link student to parent
            if (student.studentProfile?.id) {
                await prisma.student.update({
                    where: { id: student.studentProfile.id },
                    data: { 
                        parentId: parentRecord.id
                    }
                });
            }
        }
        return student;

    }

    async findAllStudents(query:StudentQueryDto) {
         const { page = '1', limit = '10', search, classId, gender } = query; 
         const where :any ={
            ...(classId && { classId }),
            ...(gender && { gender }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    ...(isNaN(Number(search)) ? [] : [{ rollNumber: Number(search) }])
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
                parent: {
                    select: {
                        phone: true
                    }
                },
                class:{
                    select:{
                        id:true,
                        name:true,
                        sections:true
                    }
                },
                admissionRecord: {
                    select: {
                        guardianPhone: true
                    }
                }
            },
            orderBy:{
                createdAt:'desc'
            }
        })
        const flattened = students.map((student) => ({
            ...student,
            email: student.user?.email,
            phone: student.parent?.phone ?? student.admissionRecord?.guardianPhone ?? null
        }));

        return {
            data: flattened,
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
            throw this.notFound("Student not found");
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
            throw this.notFound("Student not found");
        }

        return student;
    }
    async update(id: string, dto: UpdateStudentDto) {

  //  check student
  const student = await prisma.student.findUnique({
    where: { id }
  });

  if (!student) {
    throw new Error("Student not found");
  }

  //  check class
  if (dto.classId) {
    const classExists = await prisma.class.findUnique({
      where: { id: dto.classId }
    });

    if (!classExists) {
      throw new Error("Class not found");
    }
  }

    const {
        name,
        email,
        dateOfBirth,
        address,
        bloodGroup,
        avatarUrl,
        classId,
    } = dto as UpdateStudentDto & { email?: string; dateOfBirth?: string };

    const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (dateOfBirth && Number.isNaN(dob?.getTime())) {
        throw new Error('Invalid dateOfBirth');
    }

    const userUpdate: { name?: string; email?: string } = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;

    if (email) {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser && existingUser.id !== student.userId) {
            throw new Error("Email already in use");
        }
    }

    const updatedStudent = await prisma.student.update({
        where: { id },
        data: {
            ...(address !== undefined && { address }),
            ...(avatarUrl !== undefined && { photo: avatarUrl }),
            ...(bloodGroup !== undefined && { bloodGroup: bloodGroup as any }),
            ...(dob && { dob }),
            ...(classId && { class: { connect: { id: classId } } }),
            ...(name && { name }),
            ...(Object.keys(userUpdate).length > 0 && { user: { update: userUpdate } }),
        },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      section: {
        select: {
          id: true,
          name: true,
          class: true,
        },
      },
    },
  });

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
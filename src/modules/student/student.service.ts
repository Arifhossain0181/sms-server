import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './student.dto';
import prisma from '../../config/db';
import bcrypt from 'bcryptjs';
import { paginate } from '../../utils/pagination.util';
import logger from '../../utils/logger';


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
        // Check roll number uniqueness per section, not globally
        const rollexists = await prisma.student.findFirst({
            where: {
                rollNumber,
                classId: dto.classId
            }
        });
        if (rollexists) {
            throw new Error("Roll number already exists in this class");
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
        const bloodGroupMap = {
            'A+': 'A_POS',
            'A-': 'A_NEG',
            'B+': 'B_POS',
            'B-': 'B_NEG',
            'AB+': 'AB_POS',
            'AB-': 'AB_NEG',
            'O+': 'O_POS',
            'O-': 'O_NEG'
        };
        
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
                        bloodGroup: bloodGroupMap[dto.bloodGroup as keyof typeof bloodGroupMap] as any,
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
                        phone: true,
                        name: true
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
                        guardianPhone: true,
                        guardianEmail: true,
                        guardianName: true
                    }
                }
            },
            orderBy:{
                createdAt:'desc'
            }
        })
        const flattened = students.map((student) => {
            // Try to get guardian email from admission record first, then from parent user email if exists
            const guardianEmail = student.admissionRecord?.guardianEmail ?? 
                                 (student.parent?.name 
                                   ? `${student.parent.name.toLowerCase().replace(/\s+/g, '.')}@school.local` 
                                   : null);
            
            return {
                ...student,
                email: student.user?.email,
                guardianEmail: guardianEmail ?? "—",
                phone: student.parent?.phone ?? student.admissionRecord?.guardianPhone ?? null
            };
        });

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
        try {
            logger.debug(`[DASHBOARD] User accessing dashboard: ${userId}`);
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
                    },
                    admissionRecord: {
                        select: {
                            id: true,
                            status: true,
                            paymentStatus: true
                        }
                    }
                }
            });

            if (!student) {
                logger.debug(`Student profile NOT FOUND for user: ${userId}`);
                throw this.notFound("Student not found");
            }

            logger.debug(`Student found: ${student.user.email}, admission: ${student.admissionRecord?.status || 'UNKNOWN'}`);
            return student;
        } catch (error) {
            logger.error(`findStudentByUserId failed for user ${userId}:`, error);
            throw error;
        }
    }

    async getStudentForEdit(id: string) {
        /**
         * Get all student data for editing - returns all fields that can be edited
         * This is used to auto-populate the edit form with current student information
         */
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                class: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                section: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                parent: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        relation: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!student) {
            throw this.notFound("Student not found");
        }

        // Return data formatted for edit form - matches UpdateStudentDto structure
        return {
            id: student.id,
            studentId: student.studentId,
            rollNumber: student.rollNumber,
            // Personal Information
            name: student.name,
            email: student.user?.email,
            phone: student.parent?.phone,
            address: student.address,
            dateOfBirth: student.dob ? student.dob.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
            gender: student.gender,
            bloodGroup: student.bloodGroup,
            avatarUrl: student.photo,
            religion: student.religion,
            // Academic Information
            classId: student.classId,
            className: student.class?.name,
            sectionId: student.sectionId,
            sectionName: student.section?.name,
            isActive: student.isActive,
            // Guardian/Parent Information
            guardianName: student.parent?.name,
            guardianEmail: student.parent?.user?.email,
            guardianPhone: student.parent?.phone,
            guardianRelation: student.parent?.relation,
            // Timestamps
            createdAt: student.createdAt,
            updatedAt: student.updatedAt
        };
    }

    async update(id: string, dto: UpdateStudentDto) {
        // Fetch current student data first (so admin can see what exists)
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                },
                class: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                section: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                parent: {
                    select: {
                        id: true,
                        userId: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });

        if (!student) {
            throw new Error("Student not found");
        }

        // Validate class if provided
        if (dto.classId) {
            const classExists = await prisma.class.findUnique({
                where: { id: dto.classId }
            });
            if (!classExists) {
                throw new Error("Class not found");
            }
        }

        // Extract and validate fields
        const {
            name,
            email,
            dateOfBirth,
            address,
            bloodGroup,
            avatarUrl,
            classId,
            phone,
            guardianName,
            guardianPhone,
            guardianEmail,
            guardianRelation
        } = dto as UpdateStudentDto & { email?: string; dateOfBirth?: string };

        // Validate dateOfBirth if provided
        let dob: Date | undefined;
        if (dateOfBirth) {
            dob = new Date(dateOfBirth);
            if (Number.isNaN(dob.getTime())) {
                throw new Error('Invalid dateOfBirth format');
            }
        }

        // Blood group mapping
        const bloodGroupMap: Record<string, string> = {
            'A+': 'A_POS',
            'A-': 'A_NEG',
            'B+': 'B_POS',
            'B-': 'B_NEG',
            'AB+': 'AB_POS',
            'AB-': 'AB_NEG',
            'O+': 'O_POS',
            'O-': 'O_NEG'
        };

        // Validate email uniqueness if provided
        if (email && email !== student.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                throw new Error("Email already in use by another user");
            }
        }

        // Prepare user update data
        const userUpdate: Record<string, any> = {};
        if (name !== undefined) userUpdate.name = name;
        if (email !== undefined) userUpdate.email = email;

        // Map blood group if provided
        const mappedBloodGroup = bloodGroup !== undefined 
            ? bloodGroupMap[bloodGroup as keyof typeof bloodGroupMap] || bloodGroup
            : undefined;

        // Prepare student update data - only include fields that are explicitly provided
        const studentUpdateData: Record<string, any> = {};
        
        if (name !== undefined) studentUpdateData.name = name;
        if (address !== undefined) studentUpdateData.address = address;
        if (avatarUrl !== undefined) studentUpdateData.photo = avatarUrl;
        if (bloodGroup !== undefined) studentUpdateData.bloodGroup = mappedBloodGroup;
        if (dob !== undefined) studentUpdateData.dob = dob;
        if (classId !== undefined) {
            // Use relation connect instead of foreign key
            studentUpdateData.class = { connect: { id: classId } };
        }
        
        // Update user if there are user field changes
        if (Object.keys(userUpdate).length > 0) {
            studentUpdateData.user = { update: userUpdate };
        }

        // Handle parent/guardian information separately if provided
        let parentUpdated = false;
        if (guardianName !== undefined || guardianPhone !== undefined || guardianEmail !== undefined || guardianRelation !== undefined) {
            if (student.parent?.id) {
                // Update existing parent
                const parentUpdateData: Record<string, any> = {};
                if (guardianName !== undefined) parentUpdateData.name = guardianName;
                if (guardianPhone !== undefined) parentUpdateData.phone = guardianPhone;
                
                if (Object.keys(parentUpdateData).length > 0) {
                    await prisma.parent.update({
                        where: { id: student.parent.id },
                        data: parentUpdateData
                    });
                    parentUpdated = true;
                }

                // Update parent user email if provided
                if (guardianEmail !== undefined && student.parent.userId) {
                    await prisma.user.update({
                        where: { id: student.parent.userId },
                        data: { email: guardianEmail }
                    });
                }
            } else if (guardianName || guardianEmail) {
                // Create parent record if guardian info is provided and no parent exists
                const parentUser = await prisma.user.create({
                    data: {
                        name: guardianName || 'Guardian',
                        email: guardianEmail || `guardian-${Date.now()}@school.local`,
                        passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
                        role: 'PARENT'
                    }
                });

                const parentRecord = await prisma.parent.create({
                    data: {
                        userId: parentUser.id,
                        name: guardianName || 'Guardian',
                        phone: guardianPhone || ''
                    }
                });

                studentUpdateData.parentId = parentRecord.id;
                parentUpdated = true;
            }
        }

        // Update the student (only with provided fields)
        const updatedStudent = await prisma.student.update({
            where: { id },
            data: studentUpdateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                },
                class: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                section: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                parent: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            }
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

  async getClassRoutine(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { sectionId: true, classId: true }
    });

    if (!student) {
      throw this.notFound("Student not found");
    }

    const routines = await prisma.timetable.findMany({
      where: {
        sectionId: student.sectionId,
        classId: student.classId
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true
          }
        },
        teacher: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return routines;
  }

  async getStudentDashboard(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true
          }
        },
        section: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!student) {
      throw this.notFound("Student not found");
    }

    const [attendance, results, routine] = await Promise.all([
      this.getAttendance(student.id),
      this.getResults(student.id),
      this.getClassRoutine(student.id)
    ]);

    return {
      profile: {
        id: student.id,
        userId: student.userId,
        studentId: student.studentId,
        name: student.name,
        email: student.user.email,
        dob: student.dob,
        gender: student.gender,
        bloodGroup: student.bloodGroup,
        photo: student.photo,
        address: student.address,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section
      },
      attendance,
      results,
      routine
    };
  }

}
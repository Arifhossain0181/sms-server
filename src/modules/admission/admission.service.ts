import prisma from "../../config/db";
import { AdmissionQueryDto, AdmissionQueryDto, ConvertToStudentDto, CreateAdmissionDto, UpdateAdmissionDto, UpdateAdmissionStatusDto } from "./admission.dto";


export const create= async(dto:CreateAdmissionDto) =>{
    const classExists = await prisma.class.findUnique({
        where: { id: dto.applyingForClass },
    })
    if (!classExists) {        throw new Error('Class not found');
    }
    const admission = await prisma.admission.create({
         data:{
            ...dto,
            dateOfBirth: new Date(dto.dateOfBirth),
                status: 'PENDING',  
         },
         include: {
            applyingForClass:{
                selecet :{
                    name: true,
                    section: true,
                }
            }
         }
    })
    // notify all amdin about new admission
     const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
    });
    await Promise.all(admins.map(admin => notificationService.send ({
        userId: admin.id,
        title: 'New Admission Application',
        body: `A new admission application has been submitted for ${admission.firstName} ${admission.lastName} applying to ${admission.applyingForClass.name} - ${admission.applyingForClass.section}. Please review the application.`,
        type: 'ADMISSION',
        data: { admissionId: admission.id },
        referenceId: admission.id,
      
    }))) 
    return admission;
}  

export const findAll = async( query:AdmissionQueryDto) =>{
    const  {page = '1', limit = '10', search, status, classId, academicYear} = query;
    const where: any = {
        ...(search && { status}),
        ...(classId && { applyingForClassId: classId }),
        ...(academicYear && { academicYear }),
        ...(search && {
            or:[
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { guardianName: { contains: search, mode: 'insensitive' } },
                { guardianPhone: { contains: search, mode: 'insensitive' } },
                { guardianEmail: { contains: search, mode: 'insensitive' } },
            ]
        })
    };
    const {skip, take ,meta} = getPagination(
prisma.admission, where, parseInt(page), parseInt(limit)
    );
    const admissions = await prisma.admission.findMany({
        where,
        skip,
        take,
        include: {
            applyingForClass: {
                select: {
                    name: true,
                    section: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    })
    return { data: admissions, meta };
}

export const findById = async(id:string) =>{
    const admission = await prisma.admission.findUnique({
        where: { id },
        include: {
            applyingForClass: true,
        },
        
    })
    if(!admission) {
        throw new Error('Admission not found');
    }
    return admission;
}

export const   update = async(id:string, dto: UpdateAdmissionDto) =>{
    const admission = await prisma.admission.findUnique({ where: { id } });
    if (!admission) {
        throw new Error('Admission not found');
    }
    return await prisma.admission.update({
        where: { id },
        data: {
            ...dto,
            ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        }
    })
}


export const updateStatus = async(id:string, dto: UpdateAdmissionStatusDto ,reviewedById: string) =>{
    const admission = await prisma.admission.findUnique({ where: { id } });
    if (!admission) {
        throw new Error('Admission not found');
    }
     
    const updatedAdmission = await prisma.admission.update({
        where: { id },
        data: {
            status: dto.status,
            remarks: dto.remarks,
            reviewedById,
            reviewedAt: new Date(), 
        }
    }) 
     // Map status → human-friendly message
    const messages: Record<string, string> = {
      APPROVED:    'Congratulations! Your admission application has been approved.',
      REJECTED:    `Your admission application was not approved. ${dto.remarks ?? ''}`.trim(),
      REVIEWING:   'Your admission application is currently under review.',
      WAITLISTED:  'You have been placed on the waitlist for admission.',
    };
    const body = messages[dto.status] ?? `Your admission status changed to ${dto.status}`;
 
    // Notify guardian (if they have a user account)
    const guardianUser = await prisma.user.findFirst({
      where: { email: admission.guardianEmail },
    });
 
    if (guardianUser) {
      await notificationService.send({
        userId: guardianUser.id,
        title: `Admission ${dto.status}`,
        body,
        type: 'ADMISSION',
        referenceId: id,
      });
    }
 
    return updated;
}

export const convertToStudent = async (dto:ConvertToStudentDto) =>{
    const admission = await prisma.admission.findUnique({ where: { id: dto.admissionId } });
    if (!admission) {
        throw new Error('Admission not found');
    }
    if(admission.status !== 'APPROVED') {
        throw new Error('Only approved admissions can be converted to students');
    } 
    if(admission.convertedToStudent) {
        throw new Error('This admission has already been converted to a student');
        
    }
    const emailExists = await prisma.user.findUnique({ where: { email: dto.email } });
    if (emailExists) {
        throw new Error('Email already in use');
    }
    const rollExists = await prisma.student.findUnique({ where: { rollNumber: dto.rollNumber } });
    if (rollExists) {
        throw new Error('Roll number already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
// Create user + student in a transaction, then link back to admission
    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: `${admission.firstName} ${admission.lastName}`,
          email: dto.email,
          password: hashedPassword,
          role: 'STUDENT',
          student: {
            create: {
              rollNumber: dto.rollNumber,
              classId: admission.applyingForClass,
              dateOfBirth: admission.dateOfBirth,
              gender: admission.gender,
              bloodGroup: admission.bloodGroup,
              guardianName: admission.guardianName,
              guardianPhone: admission.guardianPhone,
              guardianEmail: admission.guardianEmail,
              guardianRelation: admission.guardianRelation,
              avatarUrl: admission.photoUrl,
            },
          },
        },
        include: { student: true },
      });
 
      await tx.admission.update({
        where: { id: dto.admissionId },
        data: { convertedToStudentId: user.student!.id },
      });
 
      return user;
    });
    return student;
}

export const delete(id:string) =>{
    const admission = prisma.admission.findUnique({ where: { id } });
    if (!admission) {
        throw new Error('Admission not found');
    }
    return prisma.admission.delete({ where: { id } });

}

export const  getStats() {
    const [total, pending, approved, rejected, reviewing, waitlisted] = await Promise.all([
      prisma.admission.count(),
      prisma.admission.count({ where: { status: 'PENDING' } }),
      prisma.admission.count({ where: { status: 'APPROVED' } }),
      prisma.admission.count({ where: { status: 'REJECTED' } }),
      prisma.admission.count({ where: { status: 'REVIEWING' } }),
      prisma.admission.count({ where: { status: 'WAITLISTED' } }),
    ]);
 
    return { total, pending, approved, rejected, reviewing, waitlisted };

}
      private async _exists(id: string) {
    const admission = await prisma.admission.findUnique({ where: { id } });
    if (!admission) throw new Error('Admission record not found');
    return admission;
  }
}
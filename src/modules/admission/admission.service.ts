import { AdmissionQueryDto, AdmissionQueryDto, CreateAdmissionDto, UpdateAdmissionDto, UpdateAdmissionStatusDto } from "./admission.dto";


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

    
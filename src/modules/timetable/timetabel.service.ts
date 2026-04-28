import { BulkCreateTimetableDto, CreateTimetableSlotDto, TimetableQueryDto, UpdateTimetableSlotDto } from "./timetable.dto";


export const createSlot = async(dto:CreateTimetableSlotDto) =>{
    const {classId, subjectId, teacherId, dayOfWeek, startTime, endTime, roomNumber} = dto;
    return prisma.timetable.create({
        data:dto,
        include:{
            class:true,
            subject:true,
            teacher:true
        }
    })
} 

export const bulkCretae = async(dto:BulkCreateTimetableDto)=>{
    const classExists = await  prisma.class.findUnique({ where: { id: dto.classId } });
    if (!classExists) {
        throw new Error('Class not found');
    }
    for(const slot of dto.slots){
        await createSlot({ ...slot, classId: dto.classId });
    }
    const slots = await prisma.$transaction(async(tx) =>{
        await tx.timetable.deleteMany({ where: { classId: dto.classId } });

    })
    const created = await Promise.all(
        dto.slots.map(slot => 
            tx.timetable.create({
                data: { ...slot, classId: dto.classId },
                include: {
                    class: true,}
            })
       ) 
       return created;
    );
    return slots;
    
}

export const finAll= async (query:TimetableQueryDto) =>{
    const {classId, teacherId, dayOfWeek} = query;

    const where:any = {
        ...(classId && { classId }),
        ...(teacherId && { teacherId }),
        ...(dayOfWeek && { dayOfWeek }),
    };

    return prisma.timetable.findMany({ where ,
        include:{
            class:true,
            subject:true,
            teacher:true
        },
        orderBy:{
            dayOfWeek:'asc',
            startTime:'asc'
        }
    });
}

export const getClassWeeklyView = async(classId:string) =>{
      const classExists = await prisma.class.findUnique({ where: { id: classId } });
      if (!classExists) {
        throw new Error('Class not found');
      }
      const slots = await prisma.timetable.findMany({
        where: { classId },
        include: {
          subject: true,
            teacher: true,
        },
        orderBy: {
          dayOfWeek: 'asc',
          startTime: 'asc'
        }

      }) // Group by dayOfWeek
      const week: Record<string, typeof slots> = {};
        for (const slot of slots) {
            if (!week[slot.dayOfWeek]) week[slot.dayOfWeek] = [];
            week[slot.dayOfWeek].push(slot);
        }
        return week;
}

//get teacher weekly view
export const getTeacherWeeklyView = async(teacherId:string) =>{
    const teacherExists = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacherExists) {
      throw new Error('Teacher not found');
    }
    const slots = await prisma.timetable.findMany({
        where: { teacherId },
        include:{
            class:true,
            subject:true,
            teacher:true
        },
        orderBy:{
            dayOfWeek:'asc',
            startTime:'asc'}
    })
    const week: Record<string, typeof slots> = {};
    for (const slot of slots) {
        if (!week[slot.dayOfWeek]) week[slot.dayOfWeek] = [];
        week[slot.dayOfWeek].push(slot);
    }
    return week;

}

export const findById = async(id:string) =>{
    const slot = await prisma.timetable.findUnique({
        where:{id},
        include:{
            class:true,
            subject:true,
            teacher:true
        }
    })
    if(!slot){
        throw new Error('Slot not found');
    }
    return slot;
}

export const update = async(id:string ,dto:UpdateTimetableSlotDto) =>{
    const existing = await prisma.timetable.findUnique({ where: { id } });
    if (!existing) {
        throw new Error('Slot not found');
    }
    ///build marge slot for confilct check 
    const merged = {
        classId: existing.classId,
        subjectId: dto.subjectId || existing.subjectId,
        teacherId: dto.teacherId || existing.teacherId,
        dayOfWeek: dto.dayOfWeek || existing.dayOfWeek,
        startTime: dto.startTime || existing.startTime,
        endTime: dto.endTime || existing.endTime,
    }
    await  this.checkConflicts(merged, id);
    return prisma.timetable.update({
        where:{id},
        data:dto,
        include:{
            class:true,
            subject:true,
            teacher:true
        }
    })
}

export const delete = async(id:string) =>{
    return prisma.timetable.delete({ where: { id } });
     await prisma.timetable.delete({ where: { id } });
}
export const deleteClassSchefule = async(classId :string) =>{
    const classexits = await prisma.class.findUnique({ where: { id: classId } });
    if(!classexits){
        throw new Error('Class not found');
    }
    const { count } = await prisma.timetable.deleteMany({ where: { classId } });
    return { deletedSlots: count };

}


  // ─── PRIVATE HELPERS ───────────────────────────────────────────────
 
  private _include() {
    return {
      class:   { select: { id: true, name: true, section: true } },
      subject: { select: { id: true, name: true, code: true } },
      teacher: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { name: true } },
        },
      },
    };
  }
 
  private async _validateReferences(classId: string, subjectId: string, teacherId: string) {
    const [cls, subject, teacher] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId } }),
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.teacher.findUnique({ where: { id: teacherId } }),
    ]);
    if (!cls) throw new Error('Class not found');
    if (!subject) throw new Error('Subject not found');
    if (!teacher) throw new Error('Teacher not found');
  }
 
  /** Prevent same class OR same teacher being double-booked in overlapping slots */
  private async _checkConflicts(
    dto: { classId: string; teacherId: string; dayOfWeek: string; startTime: string; endTime: string },
    excludeId?: string
  ) {
    const overlap = await prisma.timetable.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        dayOfWeek: dto.dayOfWeek as any,
        OR: [
          { classId: dto.classId },
          { teacherId: dto.teacherId },
        ],
        AND: [
          { startTime: { lt: dto.endTime } },
          { endTime: { gt: dto.startTime } },
        ],
      },
    });
 
    if (overlap) {
      throw new Error(
        'Schedule conflict: the class or teacher already has a slot during this time'
      );
    }
  }
}
import { TakeAttendanceDto, UpdateAttendanceDto } from "./attendance.dto";
import prisma from "../../config/db";
import { getIO } from "../../config/socket";

export const takeAttendance = async (dto: TakeAttendanceDto, teacherId: string) => {
    const attendanceDate = new Date(dto.date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await prisma.studentAttendance.findFirst({
        where: {
            sectionId: dto.sectionId,
            date: attendanceDate,
            section: {
                classId: dto.classId,
            },
        },
    });

    if (existing) {
        throw new Error("Attendance for this class, section and date already exists");
    }

    const records = await prisma.$transaction(
        dto.entries.map((entry) => {
            return prisma.studentAttendance.create({
                data: {
                    studentId: entry.studentId,
                    sectionId: dto.sectionId,
                    teacherId,
                    date: attendanceDate,
                    status: entry.status,
                },
            });
        })
    );

    // real-time notification to admins via socket room
    try {
        getIO().to("ADMIN").emit("attendance:taken", {
            classId: dto.classId,
            sectionId: dto.sectionId,
            date: dto.date,
            totalPresent: dto.entries.filter((e) => e.status === "PRESENT").length,
            totalAbsent: dto.entries.filter((e) => e.status === "ABSENT").length,
            totalLate: dto.entries.filter((e) => e.status === "LATE").length,
        });
    } catch (err) {
        console.error("Failed to send real-time notification:", err);
    }

    return records;
};


export const getAttendanceByDate = async( classId:string, sectionId:string, date:string) => {
    const d = new Date(date);
    return await prisma.studentAttendance.findMany({
        where:{
            classId,
            sectionId,
            date:{
                gte: new Date(d.setHours(0,0,0,0)),
                lte: new Date(d.setHours(23,59,59,999))
            }
        },
        include:{
            student:true,
        }
    })
}

export const getStudentAttendance = async(student:string, month?:number, year?:number) => {
    const where:any = { studentId: student };

    if(month && year){
        where.date = {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0)
        }
    }
    const records = await prisma.studentAttendance.findMany({
        where,
        orderBy:{
            date:'desc'
        }
    })
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const Parcentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
        total,
        present,
        absent,
        late,
        Parcentage,
        records
    }


}
export const updateAttendance = async(id:string ,dto:UpdateAttendanceDto ,requesterId:string ,requesterRole:string ) => {
    const record = await prisma.studentAttendance.findUnique({
        where:{ id }
    });
    if(!record) throw { status:404, message:'Attendance record not found' };

    //only for admin can be edited 24 hours after the attendance date 
    const houreDiff= (Date.now() -new Date(record.createdAt).getTime()) / (1000 * 60 * 60);
    if(requesterRole !== 'ADMIN' && houreDiff > 24){
        throw { status:403, message:'Only admin can edit attendance after 24 hours' };

    }
    return await prisma.studentAttendance.update({
        where:{ id },
        data:dto
    })
}

export const getMonthlyReport = async(classId:string, sectionId:string, month:number, year:number) => {
        const record = await prisma.studentAttendance.findMany({
            where:{
                classId,
                sectionId,
                date:{
                    gte: new Date(year, month - 1, 1),
                    lte: new Date(year, month, 0)
                }
            },
            include:{
                student:true,
            }
        })

        // Group by student
        const grouped: Record<string, any> = {}
        for( const r of record){
            if(!grouped[r.studentId]){
                grouped[r.studentId] = {
                    student: r.student,
                    present: 0, absent: 0, late: 0, total: 0,
                

                }
            }
            grouped[r.studentId].total += 1;
            if(r.status === 'PRESENT') grouped[r.studentId].present += 1;
            else if(r.status === 'ABSENT') grouped[r.studentId].absent += 1;
            else if(r.status === 'LATE') grouped[r.studentId].late += 1;
        }
        return Object.values(grouped).map((g:any) => ({
            ...g ,
            Percentage:Math.round((g.present / g.total) * 100),
            belowThreshold:Math.round((g.present / g.total) * 100) < 75
        }))
}

// Backward-compatible aliases for legacy imports
export const getAllAttendanceBydate = getAttendanceByDate;
export const getStudentAttendacne = getStudentAttendance;
export const getMonthlyRePort = getMonthlyReport;



        
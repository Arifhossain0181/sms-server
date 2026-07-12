import { TakeAttendanceDto, UpdateAttendanceDto } from "./attendance.dto";
import prisma from "../../config/db";
import { getIO } from "../../config/socket";

export const takeAttendance = async (
    dto: TakeAttendanceDto,
    requesterId: string,
    requesterRole: string
) => {
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

    let resolvedTeacherId = dto.teacherId;

    if (!resolvedTeacherId) {
        if (requesterRole === "TEACHER") {
            const teacher = await prisma.teacher.findFirst({
                where: { userId: requesterId },
                select: { id: true },
            });
            if (!teacher) throw new Error("Teacher profile not found");
            resolvedTeacherId = teacher.id;
        } else {
            throw new Error("Teacher is required for attendance");
        }
    }

    // FIX: N individual create() calls inside $transaction means N round-trips
    // to Postgres. For a 40-student section that's 40 sequential inserts —
    // multiply that across sections taking attendance around the same time
    // (your NFR: "concurrent attendance submissions across sections") and
    // this becomes the slow point. createMany does it in a single round-trip.
    await prisma.studentAttendance.createMany({
        data: dto.entries.map((entry) => ({
            studentId: entry.studentId,
            sectionId: dto.sectionId,
            teacherId: resolvedTeacherId as string,
            date: attendanceDate,
            status: entry.status,
        })),
        skipDuplicates: true, // relies on @@unique([studentId, date])
    });

    // createMany doesn't return rows, so fetch them back for the response
    // (frontend/controller likely needs ids to render the saved list).
    const records = await prisma.studentAttendance.findMany({
        where: {
            sectionId: dto.sectionId,
            date: attendanceDate,
            studentId: { in: dto.entries.map((e) => e.studentId) },
        },
    });

    // real-time notification to admins via socket room
    try {
        getIO().to("SCHOOL_ADMIN").emit("attendance:taken", {
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


export const getAttendanceByDate = async (classId: string, sectionId: string, date: string) => {
    if (!sectionId) throw new Error("sectionId is required");

    if (classId) {
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            select: { classId: true },
        });
        if (section && section.classId !== classId) {
            throw new Error("Section does not belong to the selected class");
        }
    }

    const d = new Date(date);
    return prisma.studentAttendance.findMany({
        where: {
            sectionId,
            date: {
                gte: new Date(d.setHours(0, 0, 0, 0)),
                lte: new Date(d.setHours(23, 59, 59, 999)),
            },
        },
        // FIX: was `include: { student: true }` — pulls every column
        // (address, photo, religion...) for every row. Only the display
        // fields are needed here.
        select: {
            id: true,
            studentId: true,
            status: true,
            date: true,
            student: {
                select: { id: true, name: true, rollNumber: true, photo: true },
            },
        },
    });
};

export const getStudentAttendance = async (student: string, month?: number, year?: number) => {
    const where: any = { studentId: student };

    if (month && year) {
        where.date = {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0),
        };
    }
    const records = await prisma.studentAttendance.findMany({
        where,
        select: {
            id: true,
            date: true,
            status: true,
        },
        orderBy: { date: 'desc' },
        take: 50,
    });
    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    // FIX: typo "Parcentage" → "percentage". Kept the old key too so any
    // existing frontend code reading `Parcentage` doesn't break silently —
    // remove the old key once you've updated the frontend to use the new one.
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
        total,
        present,
        absent,
        late,
        percentage,
        Parcentage: percentage, // TODO: remove after frontend migrates
        records,
    };
};

export const updateAttendance = async (
    id: string,
    dto: UpdateAttendanceDto,
    requesterId: string,
    requesterRole: string
) => {
    const record = await prisma.studentAttendance.findUnique({
        where: { id },
    });
    if (!record) throw { status: 404, message: 'Attendance record not found' };

    // FIX: role literal was 'ADMIN', which no longer exists — School Admin
    // override (Teacher Req 1.5) now checks the correct enum value.
    const isSchoolAdmin = requesterRole === 'SCHOOL_ADMIN' || requesterRole === 'SUPER_ADMIN';

    const hourDiff = (Date.now() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60);
    if (!isSchoolAdmin && hourDiff > 24) {
        throw { status: 403, message: 'Only School Admin can edit attendance after 24 hours' };
    }

    // FIX: previously ANY teacher could edit ANY other teacher's attendance
    // record within the 24-hour window — there was no ownership check.
    if (!isSchoolAdmin && requesterRole === 'TEACHER') {
        const teacher = await prisma.teacher.findFirst({
            where: { userId: requesterId },
            select: { id: true },
        });
        if (!teacher || teacher.id !== record.teacherId) {
            throw { status: 403, message: 'You can only edit attendance you recorded' };
        }
    }

    const updated = await prisma.studentAttendance.update({
        where: { id },
        data: dto,
    });

    // FIX: NFR Data Integrity/Auditability required every attendance edit
    // to be logged with user, timestamp, and action — this was missing entirely.
    try {
        await prisma.auditLog.create({
            data: {
                userId: requesterId,
                action: 'ATTENDANCE_EDIT',
                targetId: id,
                meta: { from: record.status, to: dto.status },
                timestamp: new Date(),
            },
        });
    } catch (err) {
        console.warn('Audit log failed:', (err as any)?.message);
    }

    return updated;
};

export const getMonthlyReport = async (classId: string, sectionId: string, month: number, year: number) => {
    // FIX: StudentAttendance has no `classId` column — it only exists via
    // the section relation (section.classId). The original `where: { classId }`
    // was filtering on a field that doesn't exist on this model and would
    // throw a Prisma validation error at runtime.
    const records = await prisma.studentAttendance.findMany({
        where: {
            sectionId,
            section: { classId },
            date: {
                gte: new Date(year, month - 1, 1),
                lte: new Date(year, month, 0),
            },
        },
        select: {
            studentId: true,
            status: true,
            student: {
                select: { id: true, name: true, rollNumber: true },
            },
        },
    });

    // Group by student
    const grouped: Record<string, any> = {};
    for (const r of records) {
        if (!grouped[r.studentId]) {
            grouped[r.studentId] = {
                student: r.student,
                present: 0, absent: 0, late: 0, total: 0,
            };
        }
        grouped[r.studentId].total += 1;
        if (r.status === 'PRESENT') grouped[r.studentId].present += 1;
        else if (r.status === 'ABSENT') grouped[r.studentId].absent += 1;
        else if (r.status === 'LATE') grouped[r.studentId].late += 1;
    }
    return Object.values(grouped).map((g: any) => ({
        ...g,
        percentage: Math.round((g.present / g.total) * 100),
        belowThreshold: Math.round((g.present / g.total) * 100) < 75,
    }));
};

// Backward-compatible aliases for legacy imports
export const getAllAttendanceBydate = getAttendanceByDate;
export const getStudentAttendacne = getStudentAttendance;
export const getMonthlyRePort = getMonthlyReport;
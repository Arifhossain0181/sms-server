"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyRePort = exports.getStudentAttendacne = exports.getAllAttendanceBydate = exports.getMonthlyReport = exports.updateAttendance = exports.getStudentAttendance = exports.getAttendanceByDate = exports.takeAttendance = void 0;
const db_1 = __importDefault(require("../../config/db"));
const socket_1 = require("../../config/socket");
const takeAttendance = async (dto, teacherId) => {
    const attendanceDate = new Date(dto.date);
    attendanceDate.setHours(0, 0, 0, 0);
    const existing = await db_1.default.studentAttendance.findFirst({
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
    const records = await db_1.default.$transaction(dto.entries.map((entry) => {
        return db_1.default.studentAttendance.create({
            data: {
                studentId: entry.studentId,
                sectionId: dto.sectionId,
                teacherId,
                date: attendanceDate,
                status: entry.status,
            },
        });
    }));
    // real-time notification to admins via socket room
    try {
        (0, socket_1.getIO)().to("ADMIN").emit("attendance:taken", {
            classId: dto.classId,
            sectionId: dto.sectionId,
            date: dto.date,
            totalPresent: dto.entries.filter((e) => e.status === "PRESENT").length,
            totalAbsent: dto.entries.filter((e) => e.status === "ABSENT").length,
            totalLate: dto.entries.filter((e) => e.status === "LATE").length,
        });
    }
    catch (err) {
        console.error("Failed to send real-time notification:", err);
    }
    return records;
};
exports.takeAttendance = takeAttendance;
const getAttendanceByDate = async (classId, sectionId, date) => {
    const d = new Date(date);
    return await db_1.default.studentAttendance.findMany({
        where: {
            classId,
            sectionId,
            date: {
                gte: new Date(d.setHours(0, 0, 0, 0)),
                lte: new Date(d.setHours(23, 59, 59, 999))
            }
        },
        include: {
            student: true,
        }
    });
};
exports.getAttendanceByDate = getAttendanceByDate;
const getStudentAttendance = async (student, month, year) => {
    const where = { studentId: student };
    if (month && year) {
        where.date = {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0)
        };
    }
    const records = await db_1.default.studentAttendance.findMany({
        where,
        orderBy: {
            date: 'desc'
        }
    });
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
    };
};
exports.getStudentAttendance = getStudentAttendance;
const updateAttendance = async (id, dto, requesterId, requesterRole) => {
    const record = await db_1.default.studentAttendance.findUnique({
        where: { id }
    });
    if (!record)
        throw { status: 404, message: 'Attendance record not found' };
    //only for admin can be edited 24 hours after the attendance date 
    const houreDiff = (Date.now() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60);
    if (requesterRole !== 'ADMIN' && houreDiff > 24) {
        throw { status: 403, message: 'Only admin can edit attendance after 24 hours' };
    }
    return await db_1.default.studentAttendance.update({
        where: { id },
        data: dto
    });
};
exports.updateAttendance = updateAttendance;
const getMonthlyReport = async (classId, sectionId, month, year) => {
    const record = await db_1.default.studentAttendance.findMany({
        where: {
            classId,
            sectionId,
            date: {
                gte: new Date(year, month - 1, 1),
                lte: new Date(year, month, 0)
            }
        },
        include: {
            student: true,
        }
    });
    // Group by student
    const grouped = {};
    for (const r of record) {
        if (!grouped[r.studentId]) {
            grouped[r.studentId] = {
                student: r.student,
                present: 0, absent: 0, late: 0, total: 0,
            };
        }
        grouped[r.studentId].total += 1;
        if (r.status === 'PRESENT')
            grouped[r.studentId].present += 1;
        else if (r.status === 'ABSENT')
            grouped[r.studentId].absent += 1;
        else if (r.status === 'LATE')
            grouped[r.studentId].late += 1;
    }
    return Object.values(grouped).map((g) => ({
        ...g,
        Percentage: Math.round((g.present / g.total) * 100),
        belowThreshold: Math.round((g.present / g.total) * 100) < 75
    }));
};
exports.getMonthlyReport = getMonthlyReport;
// Backward-compatible aliases for legacy imports
exports.getAllAttendanceBydate = exports.getAttendanceByDate;
exports.getStudentAttendacne = exports.getStudentAttendance;
exports.getMonthlyRePort = exports.getMonthlyReport;

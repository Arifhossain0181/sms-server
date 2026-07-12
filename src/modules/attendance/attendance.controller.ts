import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { sendSuccess } from '../../utils/response.util';
import {
    takeAttendance,
    getAttendanceByDate,
    getStudentAttendance,
    updateAttendance,
    getMonthlyReport,
} from './attendance.service';

export class AttendanceController {
    /** Teacher / School Admin — take attendance for a section */
    async take(req: Request, res: Response, next: NextFunction) {
        try {
            const records = await takeAttendance(req.body, req.user!.id, req.user!.role);
            sendSuccess(res, records, 'Attendance recorded', 201);
        } catch (err) { next(err); }
    }

    /** Teacher / School Admin — view a section's attendance for a specific date */
    async byDate(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, sectionId, date } = req.query as Record<string, string>;
            const data = await getAttendanceByDate(classId, sectionId, date);
            sendSuccess(res, data, 'Attendance fetched');
        } catch (err) { next(err); }
    }

    /**
     * Student — view own attendance.
     * FIX target: studentId must NEVER come from the client (params/query/body).
     * It is always resolved from the authenticated user's own Student profile,
     * so a student cannot view anyone else's records by editing a URL.
     */
    async myAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const student = await prisma.student.findFirst({
                where: { userId: req.user!.id },
                select: { id: true },
            });
            if (!student) throw { status: 404, message: 'Student profile not found' };

            const { month, year } = req.query as Record<string, string>;
            const data = await getStudentAttendance(
                student.id,
                month ? Number(month) : undefined,
                year ? Number(year) : undefined
            );
            sendSuccess(res, data, 'Your attendance fetched');
        } catch (err) { next(err); }
    }

    /**
     * Parent — view a specific child's attendance.
     * FIX target: the requested studentId is only served if it actually
     * belongs to this parent's account (Student.parentId === this parent's id).
     * Without this check, any parent could view any other student's attendance
     * by guessing/enumerating studentId — a direct Privacy NFR violation.
     */
    async childAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const parent = await prisma.parent.findFirst({
                where: { userId: req.user!.id },
                select: { id: true },
            });
            if (!parent) throw { status: 404, message: 'Parent profile not found' };

            const studentId = String(req.params.studentId);
            const child = await prisma.student.findFirst({
                where: { id: studentId, parentId: parent.id },
                select: { id: true },
            });
            if (!child) throw { status: 403, message: 'This student is not linked to your account' };

            const { month, year } = req.query as Record<string, string>;
            const data = await getStudentAttendance(
                child.id,
                month ? Number(month) : undefined,
                year ? Number(year) : undefined
            );
            sendSuccess(res, data, "Child's attendance fetched");
        } catch (err) { next(err); }
    }

    /** Teacher (own record, within 24h) / School Admin (override) */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await updateAttendance(
                String(req.params.id),
                req.body,
                req.user!.id,
                req.user!.role
            );
            sendSuccess(res, updated, 'Attendance updated');
        } catch (err) { next(err); }
    }

    /** Teacher / School Admin — monthly per-student report for a section */
    async monthlyReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, sectionId, month, year } = req.query as Record<string, string>;
            const data = await getMonthlyReport(classId, sectionId, Number(month), Number(year));
            sendSuccess(res, data, 'Monthly report generated');
        } catch (err) { next(err); }
    }
}
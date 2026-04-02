import { Request, Response, NextFunction } from 'express';
import * as attendanceService from './attendance.service';
import { sendSuccess } from '../../utils/response.util';

export const takeAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw { status: 401, message: 'Unauthorized' };
    const data = await attendanceService.takeAttendance(req.body, req.user.id);
    sendSuccess(res, data, 'Attendance saved', 201);
  } catch (err) { next(err); }
};

export const getAttendanceByDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classId, sectionId, date } = req.query as Record<string, string>;
    const data = await attendanceService.getAttendanceByDate(classId, sectionId, date);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getStudentAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;
    const studentId = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
    const data = await attendanceService.getStudentAttendance(
      studentId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined
    );
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw { status: 401, message: 'Unauthorized' };
    const attendanceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await attendanceService.updateAttendance(
      attendanceId,
      req.body,
      req.user.id,
      req.user.role
    );
    sendSuccess(res, data, 'Attendance updated');
  } catch (err) { next(err); }
};

export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classId, sectionId, month, year } = req.query as Record<string, string>;
    const data = await attendanceService.getMonthlyReport(
      classId, sectionId, Number(month), Number(year)
    );
    sendSuccess(res, data);
  } catch (err) { next(err); }
};
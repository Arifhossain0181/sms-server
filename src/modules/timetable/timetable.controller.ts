import { Request, Response, NextFunction } from 'express';
import { TimetableService } from './timetable.service';
import { sendSuccess } from '../../utils/response.util';

const timetableService = new TimetableService();

export class TimetableController {
  async createSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await timetableService.createSlot(req.body);
      sendSuccess(res, slot, 'Timetable slot created', 201);
    } catch (err) { next(err); }
  }

  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const slots = await timetableService.bulkCreate(req.body);
      sendSuccess(res, slots, 'Timetable created', 201);
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await timetableService.findAll(req.query as any);
      sendSuccess(res, data, 'Timetable fetched');
    } catch (err) { next(err); }
  }

  async getClassWeeklyView(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await timetableService.getClassWeeklyView(req.params.classId);
      sendSuccess(res, data, 'Class weekly timetable fetched');
    } catch (err) { next(err); }
  }

  async getTeacherWeeklyView(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await timetableService.getTeacherWeeklyView(req.params.teacherId);
      sendSuccess(res, data, 'Teacher weekly timetable fetched');
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await timetableService.findById(req.params.id);
      sendSuccess(res, slot, 'Slot fetched');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await timetableService.update(req.params.id, req.body);
      sendSuccess(res, slot, 'Slot updated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await timetableService.delete(req.params.id);
      sendSuccess(res, null, 'Slot deleted');
    } catch (err) { next(err); }
  }

  async deleteClassSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await timetableService.deleteClassSchedule(req.params.classId);
      sendSuccess(res, result, 'Class schedule cleared');
    } catch (err) { next(err); }
  }
}
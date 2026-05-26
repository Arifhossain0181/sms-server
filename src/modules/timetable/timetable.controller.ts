import { Request, Response, NextFunction } from 'express';
import * as timetableService from './timetabel.service';
import { sendSuccess } from '../../utils/response.util';

export class TimetableController {
  async createSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await timetableService.createSlot(req.body);
      sendSuccess(res, slot, 'Timetable slot created', 201);
    } catch (err) { next(err); }
  }

  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const slots = await timetableService.bulkCretae(req.body);
      sendSuccess(res, slots, 'Timetable created', 201);
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await timetableService.finAll(req.query as any);
      sendSuccess(res, data, 'Timetable fetched');
    } catch (err) { next(err); }
  }

  async getClassWeeklyView(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await timetableService.getClassWeeklyView(req.params.classId as string);
      sendSuccess(res, data, 'Class weekly timetable fetched');
    } catch (err) { next(err); }
  }

  async getTeacherWeeklyView(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await timetableService.getTeacherWeeklyView(req.params.teacherId as string);
      sendSuccess(res, data, 'Teacher weekly timetable fetched');
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await timetableService.findById(req.params.id as string);
      sendSuccess(res, slot, 'Slot fetched');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await timetableService.update(req.params.id as string, req.body);
      sendSuccess(res, slot, 'Slot updated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await timetableService.deleteSlot(req.params.id as string);
      sendSuccess(res, null, 'Slot deleted');
    } catch (err) { next(err); }
  }

  async deleteClassSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await timetableService.deleteClassSchefule(req.params.classId as string);
      sendSuccess(res, result, 'Class schedule cleared');
    } catch (err) { next(err); }
  }
}
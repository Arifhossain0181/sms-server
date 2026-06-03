import { Request, Response, NextFunction } from 'express';
import * as timetableService from './timetabel.service';
import { sendSuccess } from '../../utils/response.util';
import { TeachersService } from '../teachers/teachers.service';

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
      const query = { ...req.query } as any;
      const userRole = (req.user as any)?.role;
      
      // Teachers can only see their own timetable
      if (userRole === 'TEACHER') {
        const myTeacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
        query.teacherId = myTeacherId;
      }
      
      const data = await timetableService.finAll(query);
      sendSuccess(res, data, 'Timetable fetched');
    } catch (err) { next(err); }
  }

  async getClassWeeklyView(req: Request, res: Response, next: NextFunction) {
    try {
      const classId = req.params.classId as string;
      const userRole = (req.user as any)?.role;
      
      // Teachers can only view classes they teach
      if (userRole === 'TEACHER') {
        const myTeacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
        
        // Check if this teacher has any classes assigned to this classId
        const prisma = require('../../config/db').default;
        const hasAccess = await prisma.timetable.findFirst({
          where: {
            classId,
            teacherId: myTeacherId
          }
        });
        
        if (!hasAccess) {
          return res.status(403).json({ 
            success: false, 
            message: 'You can only view classes you teach' 
          });
        }
      }
      
      const data = await timetableService.getClassWeeklyView(classId);
      sendSuccess(res, data, 'Class weekly timetable fetched');
    } catch (err) { next(err); }
  }

  async getTeacherWeeklyView(req: Request, res: Response, next: NextFunction) {
    try {
      const requestedTeacherId = req.params.teacherId as string;
      const userRole = (req.user as any)?.role;
      
      // Teachers can only view their own timetable
      if (userRole === 'TEACHER') {
        const myTeacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
        
        if (!myTeacherId || myTeacherId !== requestedTeacherId) {
          return res.status(403).json({ 
            success: false, 
            message: 'You can only view your own timetable' 
          });
        }
      }
      
      const data = await timetableService.getTeacherWeeklyView(requestedTeacherId);
      sendSuccess(res, data, 'Teacher weekly timetable fetched');
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const slotId = req.params.id as string;
      const userRole = (req.user as any)?.role;
      
      const slot = await timetableService.findById(slotId);
      
      // Teachers can only view their own slots
      if (userRole === 'TEACHER') {
        const myTeacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
        
        if (slot.teacherId !== myTeacherId) {
          return res.status(403).json({ 
            success: false, 
            message: 'You can only view your own timetable slots' 
          });
        }
      }
      
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
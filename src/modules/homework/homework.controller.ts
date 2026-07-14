import { Request, Response, NextFunction } from 'express';
import { HomeworkService } from './homework.service';
import { sendSuccess } from '../../utils/response.util';
import { TeachersService } from '../teachers/teachers.service';
import { StudentService } from '../student/student.service';
import { ParentsService } from '../parents/parents.service';

export class HomeworkController {
  // ── TEACHER: create 
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

      const homework = await HomeworkService.create(teacherId, req.body);
      sendSuccess(res, homework, 'Homework created', 201);
    } catch (err) { next(err); }
  }

  // ── TEACHER: update 
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

      const homework = await HomeworkService.update(teacherId, req.params.id as string, req.body);
      sendSuccess(res, homework, 'Homework updated');
    } catch (err) { next(err); }
  }

  // ── TEACHER: mark reviewed 
  async markReviewed(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

      const homework = await HomeworkService.markReviewed(teacherId, req.params.id as string);
      sendSuccess(res, homework, 'Homework marked as reviewed');
    } catch (err) { next(err); }
  }

  // ── TEACHER: delete ─
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

      await HomeworkService.delete(teacherId, req.params.id as string);
      sendSuccess(res, null, 'Homework deleted');
    } catch (err) { next(err); }
  }

  // ── TEACHER: list own homework, filterable 
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

      const { sectionId, subjectId, status, page, pageSize } = req.query as any;
      const result = await HomeworkService.listMine(teacherId, {
        sectionId, subjectId, status,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, result, 'Homework fetched');
    } catch (err) { next(err); }
  }

  // ── TEACHER dashboard widget: overdue & unreviewed 
  async listOverdue(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
      if (!teacherId) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

      const data = await HomeworkService.listOverdue(teacherId);
      sendSuccess(res, data, 'Overdue homework fetched');
    } catch (err) { next(err); }
  }

  // ── ADMIN / TEACHER: single item with view stats 
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const homework = await HomeworkService.getById(req.params.id as string);
      sendSuccess(res, homework, 'Homework fetched');
    } catch (err) { next(err); }
  }

  // ── STUDENT: own homework 
  async getMyHomework(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = await StudentService.getStudentIdByUserId((req.user as any)?.id);
      if (!studentId) return res.status(404).json({ success: false, message: 'Student profile not found' });

      const { status, page, pageSize } = req.query as any;
      const result = await HomeworkService.getMyHomework(studentId, {
        status, page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, result, 'Your homework fetched');
    } catch (err) { next(err); }
  }

  // ── STUDENT: mark one item as viewed 
  async markViewed(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = await StudentService.getStudentIdByUserId((req.user as any)?.id);
      if (!studentId) return res.status(404).json({ success: false, message: 'Student profile not found' });

      const result = await HomeworkService.markViewed(studentId, req.params.id as string);
      sendSuccess(res, result, 'Marked as viewed');
    } catch (err) { next(err); }
  }

  // ── PARENT: a specific child's homework 
  async getChildHomework(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = await ParentsService.getParentIdByUserId((req.user as any)?.id);
      if (!parentId) return res.status(404).json({ success: false, message: 'Parent profile not found' });

      const { status, page, pageSize } = req.query as any;
      const result = await HomeworkService.getChildHomework(parentId, req.params.studentId as string, {
        status, page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, result, "Child's homework fetched");
    } catch (err) { next(err); }
  }
}
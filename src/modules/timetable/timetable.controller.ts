import { Request, Response, NextFunction } from 'express';
import * as timetableService from './timetable.service';
import { sendSuccess } from '../../utils/response.util';
import { TeachersService } from '../teachers/teachers.service';
import { StudentService } from '../student/student.service';
import { ParentsService } from '../parents/parents.service';



export class TimetableController {
  // ── ADMIN: create a single slot ─────────────────────────────────
  async createSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await timetableService.createSlot(req.body);
      sendSuccess(res, slot, 'Timetable slot created', 201);
    } catch (err) { next(err); }
  }

  // ── ADMIN: replace a class's full weekly timetable ───────────────
  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const slots = await timetableService.bulkCreate(req.body);
        sendSuccess(res, slots, 'Timetable created', 201);
      } catch (err) { next(err); }
  }

  // ── ADMIN / TEACHER: filtered/paginated list ──────────────────────
  // NOTE: STUDENT was removed from this route's roles (see routes file).
  // A raw filter list isn't something a student should be able to query
  // freely with arbitrary classId/teacherId — they use /my-routine instead.
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = { ...req.query } as any;
      const userRole = (req.user as any)?.role;

      // Teachers can only see their own timetable rows
      if (userRole === 'TEACHER') {
        const myTeacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
        query.teacherId = myTeacherId;
      }

      const page = query.page ? Number(query.page) : undefined;
      const pageSize = query.pageSize ? Number(query.pageSize) : undefined;
      delete query.page;
      delete query.pageSize;

      const data = await timetableService.finAll(query, { page, pageSize });
      sendSuccess(res, data, 'Timetable fetched');
    } catch (err) { next(err); }
  }

  // ── ADMIN / TEACHER: any class's weekly view, by classId ──────────
  // NOTE: STUDENT no longer allowed here (see routes file) — this is the
  // "browse any class" route, meant for staff use.
  async getClassWeeklyView(req: Request, res: Response, next: NextFunction) {
    try {
      const classId = req.params.classId as string;
      const userRole = (req.user as any)?.role;

      if (userRole === 'TEACHER') {
        const myTeacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
        const teachesThisClass = await timetableService.teacherTeachesClass(myTeacherId, classId);
        if (!teachesThisClass) {
          return res.status(403).json({ success: false, message: 'You can only view classes you teach' });
        }
      }

      const data = await timetableService.getClassWeeklyView(classId);
      sendSuccess(res, data, 'Class weekly timetable fetched');
    } catch (err) { next(err); }
  }

  // ── ADMIN / TEACHER: a teacher's own weekly view ──────────────────
  async getTeacherWeeklyView(req: Request, res: Response, next: NextFunction) {
    try {
      const requestedTeacherId = req.params.teacherId as string;
      const userRole = (req.user as any)?.role;

      if (userRole === 'TEACHER') {
        const myTeacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
        if (!myTeacherId || myTeacherId !== requestedTeacherId) {
          return res.status(403).json({ success: false, message: 'You can only view your own timetable' });
        }
      }

      const data = await timetableService.getTeacherWeeklyView(requestedTeacherId);
      sendSuccess(res, data, 'Teacher weekly timetable fetched');
    } catch (err) { next(err); }
  }

  // ── STUDENT: "my routine" — classId resolved server-side ──────────
  // WHAT: student never supplies a classId — we look it up from their
  //       own profile, so there is nothing to fake or guess.
  async getMyRoutine(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = await StudentsService.getStudentIdByUserId((req.user as any)?.id);
      if (!studentId) return res.status(404).json({ success: false, message: 'Student profile not found' });

      const data = await timetableService.getMyClassTimetable(studentId);
      sendSuccess(res, data, 'Your weekly routine fetched');
    } catch (err) { next(err); }
  }

  // ── STUDENT dashboard widget: today's classes only ────────────────
  async getMyTodayRoutine(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = await StudentsService.getStudentIdByUserId((req.user as any)?.id);
      if (!studentId) return res.status(404).json({ success: false, message: 'Student profile not found' });

      const data = await timetableService.getTodaysClassesForStudent(studentId);
      sendSuccess(res, data, "Today's classes fetched");
    } catch (err) { next(err); }
  }

  // ── PARENT: routine for one of their children ──────────────────────
  // WHAT: ownership is verified inside the service (student must belong
  //       to this parent) before any data is returned.
  async getChildRoutine(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = await ParentsService.getParentIdByUserId((req.user as any)?.id);
      if (!parentId) return res.status(404).json({ success: false, message: 'Parent profile not found' });

      const studentId = req.params.studentId as string;
      const data = await timetableService.getChildClassTimetable(parentId, studentId);
      sendSuccess(res, data, "Child's weekly routine fetched");
    } catch (err) { next(err); }
  }

  // ── PARENT dashboard widget: today's classes for one child ────────
  async getChildTodayRoutine(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = await ParentsService.getParentIdByUserId((req.user as any)?.id);
      if (!parentId) return res.status(404).json({ success: false, message: 'Parent profile not found' });

      const studentId = req.params.studentId as string;
      const data = await timetableService.getTodaysClassesForChild(parentId, studentId);
      sendSuccess(res, data, "Child's classes for today fetched");
    } catch (err) { next(err); }
  }

  // ── ADMIN / TEACHER: single slot by id ─────────────────────────────
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const slotId = req.params.id as string;
      const userRole = (req.user as any)?.role;

      const slot = await timetableService.findById(slotId);

      if (userRole === 'TEACHER') {
        const myTeacherId = await TeachersService.getTeacherIdByUserId((req.user as any)?.id);
        if (slot.teacher.id !== myTeacherId) {
          return res.status(403).json({ success: false, message: 'You can only view your own timetable slots' });
        }
      }

      sendSuccess(res, slot, 'Slot fetched');
    } catch (err) { next(err); }
  }

  // ── ADMIN: update a slot ────────────────────────────────────────────
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await timetableService.update(req.params.id as string, req.body);
      sendSuccess(res, slot, 'Slot updated');
    } catch (err) { next(err); }
  }

  // ── ADMIN: delete one slot ──────────────────────────────────────────
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await timetableService.deleteSlot(req.params.id as string);
      sendSuccess(res, null, 'Slot deleted');
    } catch (err) { next(err); }
  }

  // ── ADMIN: wipe a class's entire schedule ───────────────────────────
  async deleteClassSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await timetableService.deleteClassSchefule(req.params.classId as string);
      sendSuccess(res, result, 'Class schedule cleared');
    } catch (err) { next(err); }
  }
}
import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { ParentsService } from './parents.service';
import { getAttendance } from '../student/student.attendence';
import { sendSuccess } from '../../utils/response.util';

export class ParentsController {
  // ── ADMIN: create a parent profile ────────────────────────────────
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parent = await ParentsService.createParent(req.body);
      sendSuccess(res, parent, 'Parent profile created', 201);
    } catch (err) { next(err); }
  }

  // ── ADMIN: update any parent by id ────────────────────────────────
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parent = await ParentsService.updateParent(req.params.id as string, req.body);
      sendSuccess(res, parent, 'Parent profile updated');
    } catch (err) { next(err); }
  }

  // ── ADMIN: delete a parent profile ────────────────────────────────
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ParentsService.deleteParent(req.params.id as string);
      sendSuccess(res, null, 'Parent profile deleted');
    } catch (err) { next(err); }
  }

  // ── ADMIN: paginated list, optional ?search= ──────────────────────
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page, pageSize } = req.query as any;
      const result = await ParentsService.getAllParents({
        search,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, result, 'Parents fetched');
    } catch (err) { next(err); }
  }

  // ── ADMIN: single parent by id, with children ─────────────────────
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const parent = await ParentsService.getParentById(req.params.id as string);
      sendSuccess(res, parent, 'Parent fetched');
    } catch (err) { next(err); }
  }

  // ── ADMIN: link a student to a parent ─────────────────────────────
  async linkChild(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.body;
      const result = await ParentsService.linkChild(req.params.id as string, studentId);
      sendSuccess(res, result, 'Child linked to parent');
    } catch (err) { next(err); }
  }

  // ── ADMIN: unlink a student from a parent ─────────────────────────
  async unlinkChild(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ParentsService.unlinkChild(req.params.id as string, req.params.studentId as string);
      sendSuccess(res, result, 'Child unlinked from parent');
    } catch (err) { next(err); }
  }

  // =====================================================================
  // PARENT SELF-SERVICE — resolves everything from the logged-in user,
  // never trusts a parentId from the client.
  // =====================================================================

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await ParentsService.getMyProfile((req.user as any)?.id);
      sendSuccess(res, profile, 'Your profile fetched');
    } catch (err) { next(err); }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await ParentsService.updateMyProfile((req.user as any)?.id, req.body);
      sendSuccess(res, profile, 'Your profile updated');
    } catch (err) { next(err); }
  }

  async getMyChildren(req: Request, res: Response, next: NextFunction) {
    try {
      const children = await ParentsService.getMyChildren((req.user as any)?.id);
      sendSuccess(res, children, 'Your children fetched');
    } catch (err) { next(err); }
  }

  async getMyPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = req.query as any;
      const payments = await ParentsService.getMyPayments((req.user as any)?.id, {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, payments, 'Your payment history fetched');
    } catch (err) { next(err); }
  }

  async getMyNotices(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = req.query as any;
      const notices = await ParentsService.getMyNotices((req.user as any)?.id, {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, notices, 'Your notices fetched');
    } catch (err) { next(err); }
  }

  // =====================================================================
  // PARENT SELF-SERVICE: CHILD ACADEMIC DATA
  // =====================================================================

  async getMyChildrenDetailed(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');

      const children = await prisma.student.findMany({
        where: { parentId },
        select: {
          id: true,
          name: true,
          rollNumber: true,
          classId: true,
          sectionId: true,
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
        orderBy: { name: 'asc' },
      });

      const childrenWithAttendance = await Promise.all(
        children.map(async (child) => {
          try {
            const attendance = await getAttendance(child.id);
            return {
              ...child,
              attendancePercentage: attendance.percentage,
              attendanceSummary: attendance,
            };
          } catch {
            return { ...child, attendancePercentage: 0, attendanceSummary: null };
          }
        })
      );

      sendSuccess(res, childrenWithAttendance, 'Your children fetched');
    } catch (err) { next(err); }
  }

  async getChildProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');
      const profile = await ParentsService.getChildProfile(parentId, req.params.childId as string);
      sendSuccess(res, profile, 'Child profile fetched');
    } catch (err) { next(err); }
  }

  async getChildAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');
      const { month, year } = req.query as any;
      const data = await ParentsService.getChildAttendance(
        parentId,
        req.params.childId as string,
        month ? Number(month) : undefined,
        year ? Number(year) : undefined
      );
      sendSuccess(res, data, 'Child attendance fetched');
    } catch (err) { next(err); }
  }

  async getChildResults(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');
      const data = await ParentsService.getChildResults(parentId, req.params.childId as string);
      sendSuccess(res, data, 'Child results fetched');
    } catch (err) { next(err); }
  }

  async getChildClassHighestMarks(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');
      const data = await ParentsService.getChildClassHighestMarks(parentId, req.params.childId as string);
      sendSuccess(res, data, 'Class highest marks fetched');
    } catch (err) { next(err); }
  }

  async getChildHomework(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');
      const data = await ParentsService.getChildHomework(parentId, req.params.childId as string);
      sendSuccess(res, data, 'Child homework fetched');
    } catch (err) { next(err); }
  }

  async getChildTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');
      const data = await ParentsService.getChildTimetable(parentId, req.params.childId as string);
      sendSuccess(res, data, 'Child timetable fetched');
    } catch (err) { next(err); }
  }

  async getChildReportCards(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');
      const data = await ParentsService.getChildReportCards(parentId, req.params.childId as string);
      sendSuccess(res, data, 'Child report cards fetched');
    } catch (err) { next(err); }
  }

  async getChildAdmitCards(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');
      const data = await ParentsService.getChildAdmitCards(parentId, req.params.childId as string);
      sendSuccess(res, data, 'Child admit cards fetched');
    } catch (err) { next(err); }
  }

  async createParentPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (req.user as any)?.id;
      if (!parentId) throw new Error('Unauthorized');
      const { feeId } = req.body;
      if (!feeId) throw new Error('feeId is required');
      const data = await ParentsService.createParentPaymentIntent(parentId, feeId);
      sendSuccess(res, data, 'Payment intent created');
    } catch (err) { next(err); }
  }

  async getLowAttendanceAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = (await ParentsService.getParentIdByUserId((req.user as any)?.id));
      if (!parentId) throw new Error('Parent profile not found');
      const data = await ParentsService.getLowAttendanceAlerts(parentId);
      sendSuccess(res, data, 'Low attendance alerts fetched');
    } catch (err) { next(err); }
  }
}
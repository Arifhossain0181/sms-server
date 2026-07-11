import { Request, Response, NextFunction } from 'express';
import { ParentsService } from './parents.service';
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
}
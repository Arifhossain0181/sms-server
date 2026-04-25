import { Request, Response, NextFunction } from 'express';
import { NoticeService } from './notice.service';
import { sendSuccess } from '../../utils/response.util';

const noticeService = new NoticeService();

// Map DB role → NoticeAudience
const roleToAudience: Record<string, any> = {
  STUDENT: 'STUDENTS',
  TEACHER: 'TEACHERS',
  PARENT: 'PARENTS',
  ADMIN: 'ALL',
};

export class NoticeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const notice = await noticeService.create(req.body, req.user!.id);
      sendSuccess(res, notice, 'Notice created', 201);
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await noticeService.findAll(req.query as any);
      sendSuccess(res, data, 'Notices fetched');
    } catch (err) { next(err); }
  }

  /** Authenticated user sees only notices relevant to their role */
  async findPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const audience = roleToAudience[req.user!.role] ?? 'ALL';
      const notices = await noticeService.findPublic(audience);
      sendSuccess(res, notices, 'Notices fetched');
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const notice = await noticeService.findById(req.params.id);
      sendSuccess(res, notice, 'Notice fetched');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const notice = await noticeService.update(req.params.id, req.body);
      sendSuccess(res, notice, 'Notice updated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await noticeService.delete(req.params.id);
      sendSuccess(res, null, 'Notice deleted');
    } catch (err) { next(err); }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const notice = await noticeService.toggleActive(req.params.id);
      sendSuccess(res, notice, `Notice ${notice.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { next(err); }
  }
}
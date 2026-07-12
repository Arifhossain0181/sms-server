import { Request, Response, NextFunction } from 'express';
import {
  createNotice,
  findAll,
  getFeedForUser,
  findById,
  update as updateNotice,
  deleteNotice,
  toggleActive,
  markAsRead,
} from './notice.service';
import { sendSuccess } from '../../utils/response.util';

export class NoticeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const notice = await createNotice(req.body, req.user!.id);
      sendSuccess(res, notice, 'Notice created', 201);
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await findAll(req.query as any);
      sendSuccess(res, data, 'Notices fetched');
    } catch (err) { next(err); }
  }

  /** Authenticated user sees only notices targeted at their role */
  async feed(req: Request, res: Response, next: NextFunction) {
    try {
      const notices = await getFeedForUser({ role: req.user!.role, userId: req.user!.id });
      sendSuccess(res, notices, 'Notices fetched');
    } catch (err) { next(err); }
  }

  /** Mark a student/parent's personal notice recipient row as read */
  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipientId } = req.params as { recipientId: string };
      const recipient = await markAsRead(recipientId, req.user!.id);
      sendSuccess(res, recipient, 'Notice marked as read');
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      const notice = await findById(idStr);
      sendSuccess(res, notice, 'Notice fetched');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      const notice = await updateNotice(req.body, idStr);
      sendSuccess(res, notice, 'Notice updated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      await deleteNotice(idStr);
      sendSuccess(res, null, 'Notice deleted');
    } catch (err) { next(err); }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      const notice = await toggleActive(idStr);
      sendSuccess(res, notice, `Notice ${notice.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { next(err); }
  }
}
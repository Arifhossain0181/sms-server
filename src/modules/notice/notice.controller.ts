import { Request, Response, NextFunction } from 'express';
import {
  createNotice,
  findAll,
  getFeedForUser,
  findById as findNoticeById,
  update as updateNotice,
  deleteNotice,
  toggleActive as toggleNoticeActive,
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

  /**
   * Authenticated user sees only the notices actually created for them —
   * backed by their own NoticeRecipient rows now, not a broad role match.
   * FIX: this used to call a getFeedForUser that didn't exist in
   * notice.service.ts at all; that function is added there now.
   */
  async feed(req: Request, res: Response, next: NextFunction) {
    try {
      const notices = await getFeedForUser({ role: req.user!.role, userId: req.user!.id });
      sendSuccess(res, notices, 'Notices fetched');
    } catch (err) { next(err); }
  }

  /** Mark any actor's personal notice recipient row as read — ownership
   * is enforced inside markAsRead (student/parent/staff userId all
   * checked there), so no role restriction is needed at the route level. */
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
      const notice = await findNoticeById(idStr);
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
      const notice = await toggleNoticeActive(idStr);
      sendSuccess(res, notice, `Notice ${notice.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { next(err); }
  }
}
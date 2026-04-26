import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { sendSuccess } from '../../utils/response.util';

const notificationService = new NotificationService();

export class NotificationController {
  /** Admin: manually send to a single user */
  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.send(req.body);
      sendSuccess(res, notification, 'Notification sent', 201);
    } catch (err) { next(err); }
  }

  /** Admin: broadcast to a role or everyone */
  async broadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.broadcast(req.body);
      sendSuccess(res, result, `Notification broadcast to ${result.sent} users`);
    } catch (err) { next(err); }
  }

  /** User: get own notifications */
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await notificationService.findAll(req.user!.id, req.query as any);
      sendSuccess(res, data, 'Notifications fetched');
    } catch (err) { next(err); }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await notificationService.getUnreadCount(req.user!.id);
      sendSuccess(res, data, 'Unread count fetched');
    } catch (err) { next(err); }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markRead(req.params.id, req.user!.id);
      sendSuccess(res, notification, 'Marked as read');
    } catch (err) { next(err); }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllRead(req.user!.id);
      sendSuccess(res, result, 'All notifications marked as read');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.delete(req.params.id, req.user!.id);
      sendSuccess(res, null, 'Notification deleted');
    } catch (err) { next(err); }
  }

  async deleteAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.deleteAll(req.user!.id);
      sendSuccess(res, result, 'All notifications deleted');
    } catch (err) { next(err); }
  }
}
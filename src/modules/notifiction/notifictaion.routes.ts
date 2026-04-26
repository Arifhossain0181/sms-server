import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();
const c = new NotificationController();

router.use(authMiddleware);

// ── Admin: send & broadcast ────────────────────────────────────────
router.post('/',          roleMiddleware('ADMIN'), c.send.bind(c));
router.post('/broadcast', roleMiddleware('ADMIN'), c.broadcast.bind(c));

// ── Any authenticated user: own notifications ─────────────────────
router.get('/',                   c.findAll.bind(c));
router.get('/unread-count',       c.getUnreadCount.bind(c));
router.patch('/mark-all-read',    c.markAllRead.bind(c));
router.delete('/clear-all',       c.deleteAll.bind(c));
router.patch('/:id/read',         c.markRead.bind(c));
router.delete('/:id',             c.delete.bind(c));

export default router;
import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new NotificationController();

router.use(authenticate);

// ── Admin: send & broadcast ────────────────────────────────────────
router.post('/',          authorizeRoles('ADMIN'), c.send.bind(c));
router.post('/broadcast', authorizeRoles('ADMIN'), c.broadcast.bind(c));

// ── Any authenticated user: own notifications ─────────────────────
router.get('/',                   c.findAll.bind(c));
router.get('/unread-count',       c.getUnreadCount.bind(c));
router.patch('/mark-all-read',    c.markAllRead.bind(c));
router.delete('/clear-all',       c.deleteAll.bind(c));
router.patch('/:id/read',         c.markRead.bind(c));
router.delete('/:id',             c.delete.bind(c));

export default router;
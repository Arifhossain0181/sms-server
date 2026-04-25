import { Router } from 'express';
import { NoticeController } from './notice.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();
const c = new NoticeController();

router.use(authMiddleware);

// ── Every logged-in user sees notices for their role ───────────────
router.get('/feed', c.findPublic.bind(c));

// ── Admin: full management ─────────────────────────────────────────
router.post('/',              roleMiddleware('ADMIN'), c.create.bind(c));
router.get('/',               roleMiddleware('ADMIN'), c.findAll.bind(c));
router.get('/:id',            roleMiddleware('ADMIN'), c.findById.bind(c));
router.patch('/:id',          roleMiddleware('ADMIN'), c.update.bind(c));
router.delete('/:id',         roleMiddleware('ADMIN'), c.delete.bind(c));
router.patch('/:id/toggle',   roleMiddleware('ADMIN'), c.toggleActive.bind(c));

export default router;
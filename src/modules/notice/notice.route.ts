import { Router } from 'express';
import { NoticeController } from './notice.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new NoticeController();

router.use(authenticate);

// ── Every logged-in user sees notices for their role ───────────────
router.get('/feed', c.findPublic.bind(c));

// ── Admin: full management ─────────────────────────────────────────
router.post('/',              authorizeRoles('ADMIN'), c.create.bind(c));
router.get('/',               authorizeRoles('ADMIN'), c.findAll.bind(c));
router.get('/:id',            authorizeRoles('ADMIN'), c.findById.bind(c));
router.patch('/:id',          authorizeRoles('ADMIN'), c.update.bind(c));
router.delete('/:id',         authorizeRoles('ADMIN'), c.delete.bind(c));
router.patch('/:id/toggle',   authorizeRoles('ADMIN'), c.toggleActive.bind(c));

export default router;
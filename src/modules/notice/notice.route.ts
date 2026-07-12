import { Router } from 'express';
import { NoticeController } from './notice.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new NoticeController();

router.use(authenticate);


// Backed by getFeedForUser (notice.service.ts), which now resolves the
// correct NoticeRecipient rows for any of the 10 actors — student,
// parent, or any staff-type role — not just a broad audience match.
router.get('/feed', c.feed.bind(c));


router.patch('/read/:recipientId', c.markRead.bind(c));

// ── Admin: full management ─────────────────────────────────────────

router.post('/',              authorizeRoles('SCHOOL_ADMIN'), c.create.bind(c));
router.get('/',               authorizeRoles('SCHOOL_ADMIN'), c.findAll.bind(c));
router.get('/:id',            authorizeRoles('SCHOOL_ADMIN'), c.findById.bind(c));
router.patch('/:id',          authorizeRoles('SCHOOL_ADMIN'), c.update.bind(c));
router.delete('/:id',         authorizeRoles('SCHOOL_ADMIN'), c.delete.bind(c));
router.patch('/:id/toggle',   authorizeRoles('SCHOOL_ADMIN'), c.toggleActive.bind(c));

export default router;
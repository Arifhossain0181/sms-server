import { Router } from 'express';
import { FeeStructureController } from './feestructure.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new FeeStructureController();

router.use(authenticate);

// ── any logged-in role can check what's due for a class ──────────
// (student/parent views need this to show upcoming fees)
router.get('/class/:classId', c.findByClass.bind(c));

// ── ACCOUNTANT / SCHOOL_ADMIN: full CRUD ─────────────────────────
router.get('/',        authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN'), c.findAll.bind(c));
router.post('/',       authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN'), c.create.bind(c));
router.get('/:id',     authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN'), c.findById.bind(c));
router.patch('/:id',   authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN'), c.update.bind(c));
router.delete('/:id',  authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN'), c.delete.bind(c));

export default router;
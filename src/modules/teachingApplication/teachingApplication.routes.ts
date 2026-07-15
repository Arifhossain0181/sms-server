import { Router } from 'express';
import { TeachingApplicationController } from './teachingApplication.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new TeachingApplicationController();

// ── PUBLIC: anyone can apply, no login needed
router.post('/apply', c.apply.bind(c));

// ── HR / School Admin: review pipeline
router.use(authenticate);
router.get('/',             authorizeRoles('HR', 'SCHOOL_ADMIN'), c.findAll.bind(c));
router.get('/:id',          authorizeRoles('HR', 'SCHOOL_ADMIN'), c.findById.bind(c));
router.patch('/:id/status', authorizeRoles('HR', 'SCHOOL_ADMIN'), c.updateStatus.bind(c));

export default router;
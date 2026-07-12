import { Router } from 'express';
import { TeachingApplicationController } from './teachingApplication.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new TeachingApplicationController();

// ── PUBLIC: anyone can apply, no login needed
router.post('/apply', c.apply.bind(c));

// ── HR / ADMIN: review pipeline 
router.use(authenticate);
router.get('/',             authorizeRoles('ADMIN', 'HR'), c.findAll.bind(c));
router.get('/:id',          authorizeRoles('ADMIN', 'HR'), c.findById.bind(c));
router.patch('/:id/status', authorizeRoles('ADMIN', 'HR'), c.updateStatus.bind(c));

export default router;
import { Router } from 'express';
import { SuperAdminController } from './superAdmin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const superAdminController = new SuperAdminController();

router.use(authenticate);

// Get schools stats for super admin dashboard
router.get(
  '/schools',
  authorizeRoles('SUPER_ADMIN'),
  superAdminController.getSchools.bind(superAdminController)
);

export default router;

import { Router } from 'express';
import { RoleController } from './role.controller';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const roleController = new RoleController();

// Only SCHOOL_ADMIN and SUPER_ADMIN can assign/revoke roles
router.post('/assign', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), roleController.assignRole.bind(roleController));
router.post('/revoke', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), roleController.revokeRole.bind(roleController));

export default router;

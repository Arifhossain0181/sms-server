import { Router } from 'express';
import { EscalationController } from './escalation.controller';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const escalationController = new EscalationController();

// Only SCHOOL_ADMIN and SUPER_ADMIN can review critical actions
router.get('/', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), escalationController.getPendingEscalations.bind(escalationController));
router.patch('/:id', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), escalationController.resolveEscalation.bind(escalationController));

export default router;

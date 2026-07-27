import { Router } from 'express';
import { TCController } from './tc.controller';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const tcController = new TCController();

router.post('/generate', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), tcController.generateTC.bind(tcController));

export default router;

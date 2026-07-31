import { Router } from 'express';
import { TCController } from './tc.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const tcController = new TCController();

router.use(authenticate);

router.get('/all', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), tcController.getAll.bind(tcController));
router.get('/:studentId/download', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), tcController.downloadTC.bind(tcController));
router.post('/generate', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), tcController.generateTC.bind(tcController));

export default router;

import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const controller = new DashboardController();

router.use(authenticate);

router.get('/student/dashboard/exams', authorizeRoles('STUDENT'), controller.getStudentExams.bind(controller));
router.get('/parent/dashboard/exams', authorizeRoles('PARENT'), controller.getParentExams.bind(controller));

export default router;

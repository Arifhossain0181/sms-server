import { Router } from 'express';
import { SchoolAdminDashboardController } from './dashboard-school.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const controller = new SchoolAdminDashboardController();

router.use(authenticate);

router.get('/school-admin', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), controller.getDashboard.bind(controller));

export const dashboardSchoolRoutes = router;

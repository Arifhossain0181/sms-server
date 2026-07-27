import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new ReportsController();

router.use(authenticate);

router.get('/students/pdf',    authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), c.exportStudentsPdf.bind(c));
router.get('/students/csv',    authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), c.exportStudentsCsv.bind(c));
router.get('/attendance/pdf',  authorizeRoles('SCHOOL_ADMIN', 'TEACHER', 'EXAM_CONTROLLER'), c.exportAttendancePdf.bind(c));
router.get('/attendance/csv',  authorizeRoles('SCHOOL_ADMIN', 'TEACHER', 'EXAM_CONTROLLER'), c.exportAttendanceCsv.bind(c));
router.get('/fees/pdf',        authorizeRoles('SCHOOL_ADMIN', 'ACCOUNTANT'), c.exportFeesPdf.bind(c));
router.get('/fees/csv',        authorizeRoles('SCHOOL_ADMIN', 'ACCOUNTANT'), c.exportFeesCsv.bind(c));
router.get('/results/pdf',     authorizeRoles('SCHOOL_ADMIN', 'TEACHER', 'EXAM_CONTROLLER'), c.exportResultsPdf.bind(c));
router.get('/results/csv',     authorizeRoles('SCHOOL_ADMIN', 'TEACHER', 'EXAM_CONTROLLER'), c.exportResultsCsv.bind(c));

export default router;

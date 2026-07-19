import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new AttendanceController();

router.use(authenticate); // every attendance route requires login

// ── Teacher / School Admin: record & review attendance ─────────────
router.post('/take', authorizeRoles('TEACHER', 'SCHOOL_ADMIN'), c.take.bind(c));
router.get('/by-date', authorizeRoles('TEACHER', 'SCHOOL_ADMIN', 'ADMIN'), c.byDate.bind(c));
router.get('/monthly-report', authorizeRoles('TEACHER', 'SCHOOL_ADMIN'), c.monthlyReport.bind(c));
router.patch('/:id', authorizeRoles('TEACHER', 'SCHOOL_ADMIN'), c.update.bind(c));

// ── Student: own attendance only ────────────────────────────────────
router.get('/my-attendance', authorizeRoles('STUDENT'), c.myAttendance.bind(c));

// ── Parent: a linked child's attendance only ────────────────────────
router.get('/child/:studentId', authorizeRoles('PARENT'), c.childAttendance.bind(c));

export default router;
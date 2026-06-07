import { Router } from 'express';
import * as attendanceController from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { authorizeRolesOrSelf } from '../../middleware/conditionalAuth.middleware';

const router = Router();

// Teacher attendance 
router.post('/',              authenticate, authorizeRoles('ADMIN', 'TEACHER'), attendanceController.takeAttendance);

// Date wise attendance 
router.get('/',               authenticate, authorizeRoles('ADMIN', 'TEACHER'), attendanceController.getAttendanceByDate);

// Student attendance history - ADMIN/TEACHER দেখতে পারবে সবাইর, STUDENT দেখতে পারবে শুধু নিজের
router.get('/student/:studentId', authenticate, authorizeRolesOrSelf(['ADMIN', 'TEACHER'], 'studentId'), attendanceController.getStudentAttendance);

// Monthly report
router.get('/monthly-report', authenticate, authorizeRoles('ADMIN', 'TEACHER'), attendanceController.getMonthlyReport);

// Attendance update (24hr rule)
router.patch('/:id',          authenticate, authorizeRoles('ADMIN', 'TEACHER'), attendanceController.updateAttendance);

export default router;
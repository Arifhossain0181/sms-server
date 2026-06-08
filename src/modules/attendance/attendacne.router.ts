import { Router } from 'express';
import * as attendanceController from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { authorizeRolesOrSelf } from '../../middleware/conditionalAuth.middleware';

const router = Router();

// Debug middleware to log decoded token fields for student attendance requests
const logDecodedToken = (req: any, res: any, next: any) => {
	console.log('[ATTENDANCE-AUTH-DEBUG] Request params:', req.params);
	console.log('[ATTENDANCE-AUTH-DEBUG] Decoded token payload:', req.user);
	next();
};

// Teacher attendance 
router.post('/',              authenticate, authorizeRoles('ADMIN', 'TEACHER'), attendanceController.takeAttendance);

// Date wise attendance 
router.get('/',               authenticate, authorizeRoles('ADMIN', 'TEACHER'), attendanceController.getAttendanceByDate);

// Student attendance history - ADMIN/TEACHER দেখতে পারবে সবাইর, STUDENT দেখতে পারবে শুধু নিজের
router.get('/student/:studentId', authenticate, logDecodedToken, authorizeRolesOrSelf(['ADMIN', 'TEACHER'], 'studentId'), attendanceController.getStudentAttendance);

// Monthly report
router.get('/monthly-report', authenticate, authorizeRoles('ADMIN', 'TEACHER'), attendanceController.getMonthlyReport);

// Attendance update (24hr rule)
router.patch('/:id',          authenticate, authorizeRoles('ADMIN', 'TEACHER'), attendanceController.updateAttendance);

export default router;
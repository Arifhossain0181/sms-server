import { Router } from 'express';
import { HRController } from './hr.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new HRController();

// All routes require authentication
router.use(authenticate);

// ─── Dashboard ────────────────────────────────────────────────────
router.get('/dashboard', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.getDashboardStats.bind(c));

// ─── Departments ─────────────────────────────────────────────────
router.post('/departments', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.createDepartment.bind(c));
router.get('/departments', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.findAllDepartments.bind(c));
router.patch('/departments/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.updateDepartment.bind(c));
router.delete('/departments/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.deleteDepartment.bind(c));

// ─── Staff ────────────────────────────────────────────────────────
router.post('/staff', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.createStaff.bind(c));
router.get('/staff', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.findAllStaff.bind(c));
router.get('/staff/directory', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.getStaffDirectory.bind(c));
router.get('/staff/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.findStaffById.bind(c));
router.patch('/staff/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.updateStaff.bind(c));
router.delete('/staff/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.archiveStaff.bind(c));
router.patch('/staff/:id/restore', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.restoreStaff.bind(c));

// ─── Attendance ──────────────────────────────────────────────────
router.post('/attendance', authorizeRoles('HR', 'SCHOOL_ADMIN', 'TEACHER'), c.recordAttendance.bind(c));
router.post('/attendance/bulk', authorizeRoles('HR', 'SCHOOL_ADMIN', 'TEACHER'), c.recordBulkAttendance.bind(c));
router.get('/attendance/staff/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'TEACHER'), c.getStaffAttendance.bind(c));
router.get('/attendance/daily', authorizeRoles('HR', 'SCHOOL_ADMIN'), c.getDailyAttendance.bind(c));
router.get('/attendance/monthly-summary', authorizeRoles('HR', 'SCHOOL_ADMIN'), c.getAttendanceMonthlySummary.bind(c));

// ─── Leave ────────────────────────────────────────────────────────
router.post('/leave', authorizeRoles('HR', 'SCHOOL_ADMIN', 'TEACHER'), c.createLeaveRequest.bind(c));
router.get('/leave', authorizeRoles('HR', 'SCHOOL_ADMIN'), c.findAllLeaveRequests.bind(c));
router.patch('/leave/:id/approve', authorizeRoles('HR', 'SCHOOL_ADMIN'), c.approveLeaveRequest.bind(c));
router.get('/leave/staff/:id/balance', authorizeRoles('HR', 'SCHOOL_ADMIN', 'TEACHER'), c.getLeaveBalance.bind(c));
router.post('/leave/staff/:id/balance/init', authorizeRoles('HR', 'SCHOOL_ADMIN'), c.initializeLeaveBalances.bind(c));

// ─── Payroll ─────────────────────────────────────────────────────
router.post('/payroll', authorizeRoles('HR', 'SCHOOL_ADMIN', 'ACCOUNTANT'), c.generatePayroll.bind(c));
router.get('/payroll', authorizeRoles('HR', 'SCHOOL_ADMIN', 'ACCOUNTANT'), c.findAllPayrolls.bind(c));
router.get('/payroll/pending', authorizeRoles('HR', 'SCHOOL_ADMIN', 'ACCOUNTANT'), c.getPendingPayrolls.bind(c));
router.get('/payroll/staff/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'ACCOUNTANT'), c.getPayrollHistory.bind(c));
router.get('/payroll/:id/download', authorizeRoles('HR', 'SCHOOL_ADMIN', 'ACCOUNTANT'), c.downloadPayslip.bind(c));
router.patch('/payroll/:id/mark-paid', authorizeRoles('HR', 'SCHOOL_ADMIN', 'ACCOUNTANT'), c.markPayrollPaid.bind(c));

// ─── Performance Reviews ──────────────────────────────────────────
router.post('/performance', authorizeRoles('HR', 'SCHOOL_ADMIN'), c.createPerformanceReview.bind(c));
router.get('/performance/staff/:id', authorizeRoles('HR', 'SCHOOL_ADMIN'), c.findPerformanceReviews.bind(c));

// ─── Critical Actions (approval workflow) ─────────────────────────
router.post('/critical-actions', authorizeRoles('HR', 'SCHOOL_ADMIN'), c.requestCriticalAction.bind(c));
router.get('/critical-actions', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), c.findPendingCriticalActions.bind(c));
router.get('/critical-actions/:id', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), c.findCriticalActionById.bind(c));
router.patch('/critical-actions/:id/approve', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), c.approveCriticalAction.bind(c));
router.patch('/critical-actions/:id/reject', authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), c.rejectCriticalAction.bind(c));

export default router;

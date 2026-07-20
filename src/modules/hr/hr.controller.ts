import { Request, Response, NextFunction } from 'express';
import {
  createStaff,
  findAllStaff,
  findStaffById,
  updateStaff,
  archiveStaff,
  restoreStaff,
  getStaffDirectory,
  createDepartment,
  findAllDepartments,
  updateDepartment,
  deleteDepartment,
  recordAttendance,
  recordBulkAttendance,
  getStaffAttendance,
  getDailyAttendance,
  getAttendanceMonthlySummary,
  createLeaveRequest,
  findAllLeaveRequests,
  approveLeaveRequest,
  getLeaveBalance,
  initializeDefaultLeaveBalances,
  generatePayroll,
  findAllPayrolls,
  getPayrollHistory,
  markPayrollPaid,
  getPendingPayrolls,
  createPerformanceReview,
  findPerformanceReviews,
  requestCriticalAction,
  findPendingCriticalActions,
  findCriticalActionById,
  approveCriticalAction,
  rejectCriticalAction,
  getHRDashboardStats,
} from './hr.service';
import { sendSuccess, sendError } from '../../utils/response.util';

const HR_ROLES = ['HR', 'SCHOOL_ADMIN'];
const ADMIN_ROLES = ['SCHOOL_ADMIN', 'SUPER_ADMIN'];

export class HRController {
  // ─── Dashboard ──────────────────────────────────────────────────

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getHRDashboardStats();
      sendSuccess(res, data, 'Dashboard stats fetched');
    } catch (err) {
      next(err);
    }
  }

  // ─── Departments ────────────────────────────────────────────────

  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const dept = await createDepartment(req.body);
      sendSuccess(res, dept, 'Department created', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findAllDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await findAllDepartments();
      sendSuccess(res, departments, 'Departments fetched');
    } catch (err) {
      next(err);
    }
  }

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const dept = await updateDepartment(String(req.params.id), req.body);
      sendSuccess(res, dept, 'Department updated');
    } catch (err: any) {
      next(err);
    }
  }

  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const dept = await deleteDepartment(String(req.params.id));
      sendSuccess(res, dept, 'Department deactivated');
    } catch (err: any) {
      next(err);
    }
  }

  // ─── Staff management ───────────────────────────────────────────

  async createStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await createStaff(req.body, req.user!.id);
      sendSuccess(res, staff, 'Staff created successfully', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findAllStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await findAllStaff(req.query as any);
      sendSuccess(res, data, 'Staff list fetched');
    } catch (err) {
      next(err);
    }
  }

  async findStaffById(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await findStaffById(String(req.params.id));
      sendSuccess(res, staff, 'Staff fetched');
    } catch (err: any) {
      next(err);
    }
  }

  async updateStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await updateStaff(String(req.params.id), req.body);
      sendSuccess(res, staff, 'Staff updated');
    } catch (err: any) {
      next(err);
    }
  }

  async archiveStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await archiveStaff(String(req.params.id));
      sendSuccess(res, staff, 'Staff profile deactivated');
    } catch (err: any) {
      next(err);
    }
  }

  async restoreStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await restoreStaff(String(req.params.id));
      sendSuccess(res, staff, 'Staff profile restored');
    } catch (err: any) {
      next(err);
    }
  }

  async getStaffDirectory(req: Request, res: Response, next: NextFunction) {
    try {
      const directory = await getStaffDirectory();
      sendSuccess(res, directory, 'Staff directory fetched');
    } catch (err) {
      next(err);
    }
  }

  // ─── Attendance management ──────────────────────────────────────

  async recordAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordAttendance(req.body, req.user!.id);
      sendSuccess(res, record, 'Attendance recorded', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async recordBulkAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordBulkAttendance(req.body, req.user!.id);
      sendSuccess(res, result, 'Bulk attendance recorded');
    } catch (err: any) {
      next(err);
    }
  }

  async getStaffAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query as any;
      const records = await getStaffAttendance(String(req.params.id), from, to);
      sendSuccess(res, records, 'Attendance records fetched');
    } catch (err) {
      next(err);
    }
  }

  async getDailyAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query as any;
      const result = await getDailyAttendance(date || new Date().toISOString());
      sendSuccess(res, result, 'Daily attendance fetched');
    } catch (err) {
      next(err);
    }
  }

  async getAttendanceMonthlySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query as any;
      const y = year ? parseInt(year) : new Date().getFullYear();
      const m = month ? parseInt(month) : new Date().getMonth() + 1;
      const summary = await getAttendanceMonthlySummary(y, m);
      sendSuccess(res, summary, 'Monthly attendance summary fetched');
    } catch (err) {
      next(err);
    }
  }

  // ─── Leave management ───────────────────────────────────────────

  async createLeaveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await createLeaveRequest(req.body, req.user!.id);
      sendSuccess(res, leave, 'Leave request submitted', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findAllLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await findAllLeaveRequests(req.query);
      sendSuccess(res, data, 'Leave requests fetched');
    } catch (err) {
      next(err);
    }
  }

  async approveLeaveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await approveLeaveRequest(String(req.params.id), req.body, req.user!.id);
      sendSuccess(res, leave, req.body.approved ? 'Leave approved' : 'Leave rejected');
    } catch (err: any) {
      next(err);
    }
  }

  async getLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { year } = req.query as any;
      const balances = await getLeaveBalance(String(req.params.id), year ? parseInt(year) : undefined);
      sendSuccess(res, balances, 'Leave balance fetched');
    } catch (err) {
      next(err);
    }
  }

  async initializeLeaveBalances(req: Request, res: Response, next: NextFunction) {
    try {
      const { year } = req.body;
      const y = year ?? new Date().getFullYear();
      await initializeDefaultLeaveBalances(String(req.params.id), y);
      sendSuccess(res, null, 'Leave balances initialized');
    } catch (err: any) {
      next(err);
    }
  }

  // ─── Payroll management ─────────────────────────────────────────

  async generatePayroll(req: Request, res: Response, next: NextFunction) {
    try {
      const payroll = await generatePayroll(req.body, req.user!.id);
      sendSuccess(res, payroll, 'Payroll generated', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findAllPayrolls(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await findAllPayrolls(req.query);
      sendSuccess(res, data, 'Payroll records fetched');
    } catch (err) {
      next(err);
    }
  }

  async getPayrollHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await getPayrollHistory(String(req.params.id));
      sendSuccess(res, history, 'Payroll history fetched');
    } catch (err) {
      next(err);
    }
  }

  async markPayrollPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const payroll = await markPayrollPaid(String(req.params.id));
      sendSuccess(res, payroll, 'Payroll marked as paid');
    } catch (err: any) {
      next(err);
    }
  }

  async getPendingPayrolls(req: Request, res: Response, next: NextFunction) {
    try {
      const pending = await getPendingPayrolls();
      sendSuccess(res, pending, 'Pending payrolls fetched');
    } catch (err) {
      next(err);
    }
  }

  // ─── Performance Reviews ────────────────────────────────────────

  async createPerformanceReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await createPerformanceReview(req.body, req.user!.id);
      sendSuccess(res, review, 'Performance review recorded', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findPerformanceReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await findPerformanceReviews(String(req.params.id));
      sendSuccess(res, reviews, 'Performance reviews fetched');
    } catch (err) {
      next(err);
    }
  }

  // ─── Critical Actions ───────────────────────────────────────────

  async requestCriticalAction(req: Request, res: Response, next: NextFunction) {
    try {
      const action = await requestCriticalAction(req.body, req.user!.id);
      sendSuccess(res, action, 'Critical action requested', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findPendingCriticalActions(req: Request, res: Response, next: NextFunction) {
    try {
      const actions = await findPendingCriticalActions();
      sendSuccess(res, actions, 'Pending critical actions fetched');
    } catch (err) {
      next(err);
    }
  }

  async findCriticalActionById(req: Request, res: Response, next: NextFunction) {
    try {
      const action = await findCriticalActionById(String(req.params.id));
      sendSuccess(res, action, 'Critical action fetched');
    } catch (err: any) {
      next(err);
    }
  }

  async approveCriticalAction(req: Request, res: Response, next: NextFunction) {
    try {
      const action = await approveCriticalAction(
        String(req.params.id),
        req.user!.id,
        req.body.reviewComment
      );
      sendSuccess(res, action, 'Critical action approved');
    } catch (err: any) {
      next(err);
    }
  }

  async rejectCriticalAction(req: Request, res: Response, next: NextFunction) {
    try {
      const action = await rejectCriticalAction(
        String(req.params.id),
        req.user!.id,
        req.body.reviewComment || 'No comment provided'
      );
      sendSuccess(res, action, 'Critical action rejected');
    } catch (err: any) {
      next(err);
    }
  }
}

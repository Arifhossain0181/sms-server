import { Request, Response, NextFunction } from 'express';
import { getSchoolAdminDashboard } from './dashboard-school.service';
import { sendSuccess } from '../../utils/response.util';

export class SchoolAdminDashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await getSchoolAdminDashboard();
      sendSuccess(res, data, 'Dashboard data fetched');
    } catch (err) {
      next(err);
    }
  }
}

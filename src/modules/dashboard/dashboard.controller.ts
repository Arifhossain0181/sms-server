import { Request, Response, NextFunction } from 'express';
import { getStudentExamSummary, getParentDashboard } from './dashboard.service';
import { sendSuccess } from '../../utils/response.util';

export class DashboardController {
    async getStudentExams(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as any)?.id;
            const data = await getStudentExamSummary(userId);
            sendSuccess(res, data);
        } catch (err) {
            next(err);
        }
    }

    async getParentExams(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as any)?.id;
            const data = await getParentDashboard(userId);
            sendSuccess(res, data);
        } catch (err) {
            next(err);
        }
    }
}

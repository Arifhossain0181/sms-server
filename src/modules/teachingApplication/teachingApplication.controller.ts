import { Request, Response, NextFunction } from 'express';
import * as teachingApplicationService from './teachingApplication.service';
import { sendSuccess } from '../../utils/response.util';

export class TeachingApplicationController {
  // ── PUBLIC: job application form submission, no auth required ─────
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await teachingApplicationService.applyForTeaching(req.body);
      sendSuccess(res, application, 'Application submitted', 201);
    } catch (err) { next(err); }
  }

  // ── HR: paginated / filterable applicant list 
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, page, pageSize } = req.query as any;
      const result = await teachingApplicationService.listTeachingApplications({
        status,
        search,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, result, 'Applications fetched');
    } catch (err) { next(err); }
  }

  // ── HR: single application 
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await teachingApplicationService.getTeachingApplicationById(req.params.id as string);
      sendSuccess(res, application, 'Application fetched');
    } catch (err) { next(err); }
  }

  // ── HR: approve or reject 
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await teachingApplicationService.updateTeachingApplicationStatus(
        req.params.id as string,
        req.body
      );
      sendSuccess(res, result, 'Application status updated');
    } catch (err) { next(err); }
  }
}
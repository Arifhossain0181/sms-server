import { Request, Response, NextFunction } from 'express';
import {
  createJobPosting,
  findAllJobPostings,
  findJobPostingById,
  updateJobPosting,
  closeJobPosting,
  createApplicant,
  findAllApplicants,
  findApplicantById,
  updateApplicantStatus,
  createInterview,
  updateInterview,
  createOffer,
  findOfferById,
  acceptOffer,
  rejectOffer,
  createDesignationSalary,
  findAllDesignationSalaries,
  getDesignationSalary,
  getRecruitmentDashboardStats,
} from './recruitment.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export class RecruitmentController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getRecruitmentDashboardStats();
      sendSuccess(res, data, 'Recruitment stats fetched');
    } catch (err) {
      next(err);
    }
  }

  // ─── Job Postings ───────────────────────────────────────────────

  async createJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const posting = await createJobPosting(req.body, req.user!.id);
      sendSuccess(res, posting, 'Job posting created', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findAllJobPostings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await findAllJobPostings(req.query);
      sendSuccess(res, data, 'Job postings fetched');
    } catch (err) {
      next(err);
    }
  }

  async findJobPostingById(req: Request, res: Response, next: NextFunction) {
    try {
      const posting = await findJobPostingById(String(req.params.id));
      sendSuccess(res, posting, 'Job posting fetched');
    } catch (err: any) {
      next(err);
    }
  }

  async updateJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const posting = await updateJobPosting(String(req.params.id), req.body);
      sendSuccess(res, posting, 'Job posting updated');
    } catch (err: any) {
      next(err);
    }
  }

  async closeJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const posting = await closeJobPosting(String(req.params.id));
      sendSuccess(res, posting, 'Job posting closed');
    } catch (err: any) {
      next(err);
    }
  }

  // ─── Applicants ────────────────────────────────────────────────

  async createApplicant(req: Request, res: Response, next: NextFunction) {
    try {
      const applicant = await createApplicant(req.body);
      sendSuccess(res, applicant, 'Applicant created', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findAllApplicants(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await findAllApplicants(req.query);
      sendSuccess(res, data, 'Applicants fetched');
    } catch (err) {
      next(err);
    }
  }

  async findApplicantById(req: Request, res: Response, next: NextFunction) {
    try {
      const applicant = await findApplicantById(String(req.params.id));
      sendSuccess(res, applicant, 'Applicant fetched');
    } catch (err: any) {
      next(err);
    }
  }

  async updateApplicantStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const applicant = await updateApplicantStatus(String(req.params.id), req.body);
      sendSuccess(res, applicant, 'Applicant status updated');
    } catch (err: any) {
      next(err);
    }
  }

  // ─── Interviews ────────────────────────────────────────────────

  async createInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const interview = await createInterview(req.body);
      sendSuccess(res, interview, 'Interview scheduled', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const interview = await updateInterview(String(req.params.id), req.body);
      sendSuccess(res, interview, 'Interview updated');
    } catch (err: any) {
      next(err);
    }
  }

  // ─── Offers ────────────────────────────────────────────────────

  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await createOffer(req.body);
      sendSuccess(res, offer, 'Offer created', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findOfferById(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await findOfferById(String(req.params.id));
      sendSuccess(res, offer, 'Offer fetched');
    } catch (err: any) {
      next(err);
    }
  }

  async acceptOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await acceptOffer(String(req.params.id));
      sendSuccess(res, offer, 'Offer accepted');
    } catch (err: any) {
      next(err);
    }
  }

  async rejectOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await rejectOffer(String(req.params.id));
      sendSuccess(res, offer, 'Offer rejected');
    } catch (err: any) {
      next(err);
    }
  }

  // ─── Designation Salaries ──────────────────────────────────────

  async createDesignationSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const salary = await createDesignationSalary(req.body);
      sendSuccess(res, salary, 'Designation salary created', 201);
    } catch (err: any) {
      next(err);
    }
  }

  async findAllDesignationSalaries(req: Request, res: Response, next: NextFunction) {
    try {
      const salaries = await findAllDesignationSalaries();
      sendSuccess(res, salaries, 'Designation salaries fetched');
    } catch (err) {
      next(err);
    }
  }

  async getDesignationSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const salary = await getDesignationSalary(String(req.params.designation));
      sendSuccess(res, salary, 'Designation salary fetched');
    } catch (err: any) {
      next(err);
    }
  }
}

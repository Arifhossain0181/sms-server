import { Router } from 'express';
import { RecruitmentController } from './recruitment.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new RecruitmentController();

// All routes require authentication
router.use(authenticate);

// ─── Dashboard ───────────────────────────────────────────────────
router.get('/dashboard', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.getDashboardStats.bind(c));

// ─── Job Postings ────────────────────────────────────────────────
router.post('/jobs', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.createJobPosting.bind(c));
router.get('/jobs', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.findAllJobPostings.bind(c));
router.get('/jobs/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.findJobPostingById.bind(c));
router.patch('/jobs/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.updateJobPosting.bind(c));
router.patch('/jobs/:id/close', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.closeJobPosting.bind(c));

// ─── Applicants ──────────────────────────────────────────────────
router.post('/applicants', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.createApplicant.bind(c));
router.get('/applicants', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.findAllApplicants.bind(c));
router.get('/applicants/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.findApplicantById.bind(c));
router.patch('/applicants/:id/status', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.updateApplicantStatus.bind(c));

// ─── Interviews ──────────────────────────────────────────────────
router.post('/interviews', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.createInterview.bind(c));
router.patch('/interviews/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.updateInterview.bind(c));

// ─── Offers ──────────────────────────────────────────────────────
router.post('/offers', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.createOffer.bind(c));
router.get('/offers/:id', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.findOfferById.bind(c));
router.patch('/offers/:id/accept', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.acceptOffer.bind(c));
router.patch('/offers/:id/reject', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.rejectOffer.bind(c));

// ─── Designation Salaries ────────────────────────────────────────
router.post('/designation-salaries', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), c.createDesignationSalary.bind(c));
router.get('/designation-salaries', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.findAllDesignationSalaries.bind(c));
router.get('/designation-salaries/:designation', authorizeRoles('HR', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'), c.getDesignationSalary.bind(c));

export default router;

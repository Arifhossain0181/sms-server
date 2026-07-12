import { Router } from 'express';
import { AdmissionController } from './admission.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { upload } from '../../utils/upload.middleware';

const router = Router();
const c = new AdmissionController();

// ── Public: submit application (no login needed) ───────────────────
router.post('/apply', c.apply.bind(c));

// ── Public: class list for admission form ──────────────────────────
router.get('/classes', c.getPublicClasses.bind(c));

// ── Public: Stripe checkout (Pay Now) ─────────────────────────────
router.post('/stripe/checkout', c.createStripeCheckout.bind(c));
router.get('/stripe/verify', c.verifyStripeSession.bind(c));

// ── Document upload (public, pre-auth form) ────────────────────────
router.post(
  '/upload-document',
  upload.single('document'),
  c.uploadDocument.bind(c)
);

// ── Authenticated: get user's own applications ──────────────────────
router.get('/my-applications', authenticate, c.getMyApplications.bind(c));

// ── All routes below require School Admin auth ──────────────────────
// FIX: was authorizeRoles('ADMIN') — the doc's actual role (Actor 2) is
// School Admin, not a generic "ADMIN". If your Role enum literally has an
// 'ADMIN' value that means School Admin, leave as-is; otherwise change this
// string to match your Prisma Role enum exactly, e.g. 'SCHOOL_ADMIN'.
router.use(authenticate, authorizeRoles('SCHOOL_ADMIN'));

router.get('/stats',                  c.getStats.bind(c));
router.post('/convert-to-student',    c.convertToStudent.bind(c));
router.patch('/:id/status',           c.updateStatus.bind(c));
router.get('/',                       c.findAll.bind(c));
router.post('/',                      c.apply.bind(c));
router.get('/:id',                    c.findById.bind(c));
router.patch('/:id',                  c.update.bind(c));
router.delete('/:id',                 c.delete.bind(c));

export default router;
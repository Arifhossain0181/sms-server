import { Router } from 'express';
import { FeesController } from './fee.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new FeesController();

router.use(authenticate);

// ─── Role notes (per Requirement Analysis v2.1, Actor 3: Accountant) ──
// Fee structure creation, payment recording, and reports are the
// Accountant's job (1.1–1.6). School Admin's own permission list has no
// fee-management item — their involvement is dashboard *visibility*
// (3.3: "fee collection status from Accountant") and approving refunds
// above a threshold (4.3), not day-to-day fee CRUD. So:
//   - write operations (create/bulk/update/delete/pay/cash) → ACCOUNTANT
//   - report/summary reads → ACCOUNTANT + ADMIN (Admin needs visibility,
//     not write access)
//   - ADMIN was removed from routes it has no documented permission for.
// Adjust if your ADMIN role is actually meant to double as an override —
// but as specified, this is the correct split.

// ── Student routes (must come before :id params) ─────────────────────
router.get('/my-fees', authorizeRoles('STUDENT'), c.getMyFees.bind(c));

// ── Reports (before :id to avoid param clash) ──────────────────────
router.get('/report/collection',  authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN'), c.getCollectionReport.bind(c));
router.get('/report/overdue',     authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN'), c.getOverdueFees.bind(c));
router.get('/summary',            authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN'), c.getSummary.bind(c));


// the controller now verifies req.user.studentId === :studentId before
// returning data — the role check alone was letting a student read any
// student's summary by changing the URL.
router.get('/student/:studentId', authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN', 'STUDENT'), c.getStudentSummary.bind(c));

// ── Core CRUD 
router.post('/',       authorizeRoles('ACCOUNTANT'), c.create.bind(c));
router.post('/bulk',   authorizeRoles('ACCOUNTANT'), c.bulkCreate.bind(c));
router.get('/',        authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN'), c.findAll.bind(c));

router.get('/:id',     authorizeRoles('ACCOUNTANT', 'SCHOOL_ADMIN', 'STUDENT'), c.findById.bind(c));

router.patch('/:id',   authorizeRoles('ACCOUNTANT'), c.update.bind(c));
router.delete('/:id',  authorizeRoles('ACCOUNTANT'), c.delete.bind(c));

// ── Payments 
router.post('/pay',  authorizeRoles('ACCOUNTANT'), c.recordPayment.bind(c));
router.post('/cash', authorizeRoles('ACCOUNTANT'), c.recordCashPayment.bind(c));

export default router;
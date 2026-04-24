import { Router } from 'express';
import { FeesController } from './fee.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new FeesController();

router.use(authenticate);

// ── Reports (before :id to avoid param clash) ──────────────────────
router.get('/report/collection',  authorizeRoles('ADMIN'),            c.getCollectionReport.bind(c));
router.get('/student/:studentId', authorizeRoles('ADMIN', 'STUDENT'), c.getStudentSummary.bind(c));

// ── Core CRUD ──────────────────────────────────────────────────────
router.post('/',       authorizeRoles('ADMIN'), c.create.bind(c));
router.post('/bulk',   authorizeRoles('ADMIN'), c.bulkCreate.bind(c));
router.get('/',        authorizeRoles('ADMIN'), c.findAll.bind(c));
router.get('/:id',     authorizeRoles('ADMIN', 'STUDENT'), c.findById.bind(c));
router.patch('/:id',   authorizeRoles('ADMIN'), c.update.bind(c));
router.delete('/:id',  authorizeRoles('ADMIN'), c.delete.bind(c));

// ── Payments ───────────────────────────────────────────────────────
router.post('/pay', authorizeRoles('ADMIN'), c.recordPayment.bind(c));

export default router;
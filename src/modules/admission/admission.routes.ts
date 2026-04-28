import { Router } from 'express';
import { AdmissionController } from './admission.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { uploadMiddleware } from '../../middlewares/upload.middleware';

const router = Router();
const c = new AdmissionController();

// ── Public: submit application (no login needed) ───────────────────
router.post('/apply', c.apply.bind(c));

// ── Document upload (public, pre-auth form) ────────────────────────
router.post(
  '/upload-document',
  uploadMiddleware.single('document'),
  c.uploadDocument.bind(c)
);

// ── All routes below require Admin auth ────────────────────────────
router.use(authMiddleware, roleMiddleware('ADMIN'));

router.get('/stats',                  c.getStats.bind(c));
router.get('/',                       c.findAll.bind(c));
router.get('/:id',                    c.findById.bind(c));
router.patch('/:id',                  c.update.bind(c));
router.patch('/:id/status',           c.updateStatus.bind(c));
router.post('/convert-to-student',    c.convertToStudent.bind(c));
router.delete('/:id',                 c.delete.bind(c));

export default router;
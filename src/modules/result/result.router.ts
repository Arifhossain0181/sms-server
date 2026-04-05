import { Router } from 'express';
import * as resultController from './result.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();

router.post('/',                            authenticate, authorizeRoles('ADMIN', 'TEACHER'), resultController.submitResult);
router.get('/student/:studentId',           authenticate, resultController.getResultByStudent);
router.get('/exam/:examId',                 authenticate, resultController.getResultByExam);
router.get('/exam/:examId/failed',          authenticate, authorizeRoles('ADMIN', 'TEACHER'), resultController.getFailedStudents);
router.patch('/marks/:id',                  authenticate, authorizeRoles('ADMIN', 'TEACHER'), resultController.updateMark);

export default router;
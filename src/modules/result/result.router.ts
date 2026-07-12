import { Router } from 'express';
import * as resultController from './result.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();

// FIX: 'ADMIN' no longer exists in the Role enum.
const EXAM_STAFF = ['EXAM_CONTROLLER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'] as const;

router.use(authenticate);

// ── Teacher / Staff: submit & review
router.post('/',                   authorizeRoles('TEACHER', ...EXAM_STAFF), resultController.submitResult);
router.post('/bulk',               authorizeRoles('TEACHER', ...EXAM_STAFF), resultController.submitBulkResult);


router.get('/student/:studentId', authorizeRoles('TEACHER', ...EXAM_STAFF), resultController.getResultByStudent);
router.get('/exam/:examId',       authorizeRoles('TEACHER', ...EXAM_STAFF), resultController.getResultByExam);
router.get('/exam/:examId/failed', authorizeRoles('TEACHER', ...EXAM_STAFF), resultController.getFailedStudents);
router.patch('/marks/:id',        authorizeRoles('TEACHER', ...EXAM_STAFF), resultController.updateMark);

// ── Student: own published results only 
router.get('/my-results',                 authorizeRoles('STUDENT'), resultController.getMyResults);

// ── Parent: a linked child's published results only
router.get('/child/:studentId/results',   authorizeRoles('PARENT'), resultController.getChildResults);

export default router;
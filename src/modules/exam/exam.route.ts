import { Router } from 'express';
import * as examController from './exam.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();

//  Exam creation/scheduling/publishing is

const EXAM_STAFF = ['EXAM_CONTROLLER', 'SCHOOL_ADMIN'] as const;
const EXAM_VIEWERS = ['EXAM_CONTROLLER', 'SCHOOL_ADMIN', 'TEACHER'] as const;

router.use(authenticate);

router.post('/',                        authorizeRoles(...EXAM_STAFF), examController.createExam);
router.get('/',                         authorizeRoles(...EXAM_VIEWERS), examController.getAllExams);
router.get('/:id',                      authorizeRoles(...EXAM_VIEWERS), examController.getExamById);
router.put('/:id',                      authorizeRoles(...EXAM_STAFF), examController.updateExam);
router.delete('/:id',                   authorizeRoles(...EXAM_STAFF), examController.deleteExam);
router.patch('/:id/publish',            authorizeRoles(...EXAM_STAFF), examController.publishExam);
router.patch('/:id/unpublish',          authorizeRoles(...EXAM_STAFF), examController.unpublishExam);

// Schedule (staff management)
router.post('/schedules',               authorizeRoles(...EXAM_STAFF), examController.createSchedule);
router.get('/:examId/schedules',        authorizeRoles(...EXAM_VIEWERS), examController.getScheduleByExam);
router.delete('/schedules/:id',         authorizeRoles(...EXAM_STAFF), examController.deleteSchedule);

// Marks & Result (teacher entry, staff review)
router.post('/:examId/marks',            authorizeRoles('TEACHER', ...EXAM_STAFF), examController.submitExamMarks);
router.get('/:examId/failed-students',   authorizeRoles('TEACHER', ...EXAM_STAFF), examController.getFailedStudents);

// ── Student dashboard: own class schedule + own published results ───
router.get('/my/schedule',               authorizeRoles('STUDENT'), examController.getMyExamSchedule);
router.get('/my/results',                authorizeRoles('STUDENT'), examController.getMyResults);

// ── Parent dashboard: a linked child's schedule + results ───────────
router.get('/child/:studentId/schedule', authorizeRoles('PARENT'), examController.getChildExamSchedule);
router.get('/child/:studentId/results',  authorizeRoles('PARENT'), examController.getChildResults);

export default router;
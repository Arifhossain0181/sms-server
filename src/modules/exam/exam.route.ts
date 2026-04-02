import { Router } from 'express';
import * as examController from './exam.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();

router.post('/',                        authenticate, authorizeRoles('ADMIN'), examController.createExam);
router.get('/',                         authenticate, examController.getAllExams);
router.get('/:id',                      authenticate, examController.getExamById);
router.put('/:id',                      authenticate, authorizeRoles('ADMIN'), examController.updateExam);
router.delete('/:id',                   authenticate, authorizeRoles('ADMIN'), examController.deleteExam);
router.patch('/:id/publish',            authenticate, authorizeRoles('ADMIN'), examController.publishExam);
router.patch('/:id/unpublish',          authenticate, authorizeRoles('ADMIN'), examController.unpublishExam);

// Schedule
router.post('/schedules',               authenticate, authorizeRoles('ADMIN'), examController.createSchedule);
router.get('/:examId/schedules',        authenticate, examController.getScheduleByExam);
router.delete('/schedules/:id',         authenticate, authorizeRoles('ADMIN'), examController.deleteSchedule);

// Marks & Result
router.post('/:examId/marks',            authenticate, authorizeRoles('ADMIN', 'TEACHER'), examController.submitExamMarks);
router.get('/:examId/failed-students',   authenticate, authorizeRoles('ADMIN', 'TEACHER'), examController.getFailedStudents);

export default router;
import { Router } from 'express';
import * as subjectController from './subject.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();


router.post('/',                    authenticate, authorizeRoles('SCHOOL_ADMIN'), subjectController.createSubject);
router.get('/',                     authenticate, subjectController.getAllSubjects);
router.get('/:id',                  authenticate, subjectController.getSubjectById);
router.put('/:id',                  authenticate, authorizeRoles('SCHOOL_ADMIN'), subjectController.updateSubject);
router.delete('/:id',               authenticate, authorizeRoles('SCHOOL_ADMIN'), subjectController.deleteSubject);
router.patch('/:id/assign-teacher', authenticate, authorizeRoles('SCHOOL_ADMIN'), subjectController.assignTeacher);
// NEW: matches subjectService.unassignTeacher — previously no route
// could clear a subject back to "no teacher assigned".
router.delete('/:id/assign-teacher', authenticate, authorizeRoles('SCHOOL_ADMIN'), subjectController.unassignTeacher);

export default router;
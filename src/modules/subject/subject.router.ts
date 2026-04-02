

import { Router } from 'express';
import * as subjectController from './subject.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();

router.post('/',                  authenticate, authorizeRoles('ADMIN'), subjectController.createSubject);
router.get('/',                   authenticate, subjectController.getAllSubjects);
router.get('/:id',                authenticate, subjectController.getSubjectById);
router.put('/:id',                authenticate, authorizeRoles('ADMIN'), subjectController.updateSubject);
router.delete('/:id',             authenticate, authorizeRoles('ADMIN'), subjectController.deleteSubject);
router.patch('/:id/assign-teacher', authenticate, authorizeRoles('ADMIN'), subjectController.assignTeacher);

export default router;
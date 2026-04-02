import { Router } from 'express';
import * as classController from './class.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();

// Class routes
router.post('/',          authenticate, authorizeRoles('ADMIN'), classController.createClass);
router.get('/',           authenticate, classController.getAllClasses);
router.get('/:id',        authenticate, classController.getClassById);
router.put('/:id',        authenticate, authorizeRoles('ADMIN'), classController.updateClass);
router.delete('/:id',     authenticate, authorizeRoles('ADMIN'), classController.deleteClass);

// Section routes
router.post('/sections',                    authenticate, authorizeRoles('ADMIN'), classController.createSection);
router.get('/:classId/sections',            authenticate, classController.getSectionsByClass);
router.put('/sections/:id',                 authenticate, authorizeRoles('ADMIN'), classController.updateSection);
router.delete('/sections/:id',              authenticate, authorizeRoles('ADMIN'), classController.deleteSection);

export default router;
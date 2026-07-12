import { Router } from 'express';
import * as classController from './class.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();

// FIX: 'ADMIN' no longer exists in the Role enum. Class/section management
// is School Admin's job (doc Req 1.5); Super Admin included as an override,
// same pattern used in the attendance module.
const CLASS_MANAGERS = ['SCHOOL_ADMIN', 'SUPER_ADMIN'] as const;

// Class routes
router.post('/',          authenticate, authorizeRoles(...CLASS_MANAGERS), classController.createClass);
router.get('/',           authenticate, classController.getAllClasses);
router.get('/:id',        authenticate, classController.getClassById);
router.put('/:id',        authenticate, authorizeRoles(...CLASS_MANAGERS), classController.updateClass);
router.delete('/:id',     authenticate, authorizeRoles(...CLASS_MANAGERS), classController.deleteClass);

// Section routes
router.post('/sections',                    authenticate, authorizeRoles(...CLASS_MANAGERS), classController.createSection);
router.get('/:classId/sections',            authenticate, classController.getSectionsByClass);
router.put('/sections/:id',                 authenticate, authorizeRoles(...CLASS_MANAGERS), classController.updateSection);
router.delete('/sections/:id',              authenticate, authorizeRoles(...CLASS_MANAGERS), classController.deleteSection);

export default router;
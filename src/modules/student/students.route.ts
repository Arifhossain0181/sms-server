import { Router } from 'express';
import { StudentController } from './student.controllet';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { upload } from '../../utils/upload.middleware';
 
const router = Router();
const studentController = new StudentController();
 
// All routes require authentication
router.use(authenticate);
 
// Student: view own profile
router.get('/me', authorizeRoles('STUDENT'), studentController.getMyProfile.bind(studentController));
 
// Admin / Teacher access
router.post(
  '/',
  authorizeRoles('ADMIN'),
  studentController.create.bind(studentController)
);
 
router.get(
  '/',
  authorizeRoles('ADMIN', 'TEACHER'),
  studentController.findAll.bind(studentController)
);
 
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'TEACHER'),
  studentController.findById.bind(studentController)
);
 
router.patch(
  '/:id',
  authorizeRoles('ADMIN'),
  studentController.update.bind(studentController)
);
 
router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  studentController.delete.bind(studentController)
);
 
router.patch(
  '/:id/avatar',
  authorizeRoles('ADMIN'),
  upload.single('avatar'),
  studentController.uploadAvatar.bind(studentController)
);
 
router.get(
  '/:id/attendance',
  authorizeRoles('ADMIN', 'TEACHER'),
  studentController.getAttendanceSummary.bind(studentController)
);
 
router.get(
  '/:id/results',
  authorizeRoles('ADMIN', 'TEACHER'),
  studentController.getResultSummary.bind(studentController)
);
 
export default router;
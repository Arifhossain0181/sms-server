import { Router } from 'express';
import { TeacherController } from './teachers.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { upload } from '../../utils/upload.middleware';

const router = Router();
const teacherController = new TeacherController();

// All routes require authentication
router.use(authenticate);

// Teacher: view own profile & schedule
router.get('/me', authorizeRoles('TEACHER'), teacherController.getMyProfile.bind(teacherController));

// Admin only routes
router.post('/', authorizeRoles('ADMIN'), teacherController.create.bind(teacherController));

router.get(
  '/',
  authorizeRoles('ADMIN'),
  teacherController.findAll.bind(teacherController)
);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'TEACHER'),
  teacherController.findById.bind(teacherController)
);

router.patch(
  '/:id',
  authorizeRoles('ADMIN'),
  teacherController.update.bind(teacherController)
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  teacherController.delete.bind(teacherController)
);

router.patch(
  '/:id/avatar',
  authorizeRoles('ADMIN'),
  upload.single('avatar'),
  teacherController.uploadAvatar.bind(teacherController)
);

router.patch(
  '/:id/assign-subjects',
  authorizeRoles('ADMIN'),
  teacherController.assignSubjects.bind(teacherController)
);

router.patch(
  '/:id/assign-classes',
  authorizeRoles('ADMIN'),
  teacherController.assignClasses.bind(teacherController)
);

router.get(
  '/:id/schedule',
  authorizeRoles('ADMIN', 'TEACHER'),
  teacherController.getSchedule.bind(teacherController)
);

router.get(
  '/:id/dashboard',
  authorizeRoles('ADMIN', 'TEACHER'),
  teacherController.getDashboardStats.bind(teacherController)
);

export default router;
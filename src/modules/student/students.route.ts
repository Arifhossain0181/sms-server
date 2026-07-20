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

// Student: view own dashboard (all data combined)
router.get('/dashboard/my-dashboard', authorizeRoles('STUDENT'), studentController.getDashboard.bind(studentController));

// Student: view own class routine
router.get('/routine/my-routine', authorizeRoles('STUDENT'), studentController.getClassRoutine.bind(studentController));

// Admin / Teacher access
router.post(
  '/',
  authorizeRoles('SCHOOL_ADMIN'),
  studentController.create.bind(studentController)
);

router.get(
  '/',
  authorizeRoles('SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT'),
  studentController.findAll.bind(studentController)
);

router.get(
  '/:id/edit',
  authorizeRoles('SCHOOL_ADMIN'),
  studentController.getStudentForEdit.bind(studentController)
);

router.get(
  '/:id',
  authorizeRoles('SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT'),
  studentController.findById.bind(studentController)
);

router.put(
  '/:id',
  authorizeRoles('SCHOOL_ADMIN'),
  studentController.update.bind(studentController)
);

router.delete(
  '/:id',
  authorizeRoles('SCHOOL_ADMIN'),
  studentController.delete.bind(studentController)
);

router.patch(
  '/:id/avatar',
  authorizeRoles('SCHOOL_ADMIN'),
  upload.single('avatar'),
  studentController.uploadAvatar.bind(studentController)
);

router.get(
  '/:id/attendance',
  authorizeRoles('SCHOOL_ADMIN', 'TEACHER'),
  studentController.getAttendanceSummary.bind(studentController)
);

router.get(
  '/:id/results',
  authorizeRoles('SCHOOL_ADMIN', 'TEACHER'),
  studentController.getResultSummary.bind(studentController)
);

export default router;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teachers_controller_1 = require("./teachers.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const upload_middleware_1 = require("../../utils/upload.middleware");
const router = (0, express_1.Router)();
const teacherController = new teachers_controller_1.TeacherController();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Teacher: view own profile & schedule
router.get('/me', (0, role_middleware_1.authorizeRoles)('TEACHER'), teacherController.getMyProfile.bind(teacherController));
// Admin only routes
router.post('/', (0, role_middleware_1.authorizeRoles)('ADMIN'), teacherController.create.bind(teacherController));
router.get('/', (0, role_middleware_1.authorizeRoles)('ADMIN'), teacherController.findAll.bind(teacherController));
router.get('/:id', (0, role_middleware_1.authorizeRoles)('ADMIN', 'TEACHER'), teacherController.findById.bind(teacherController));
router.patch('/:id', (0, role_middleware_1.authorizeRoles)('ADMIN'), teacherController.update.bind(teacherController));
router.delete('/:id', (0, role_middleware_1.authorizeRoles)('ADMIN'), teacherController.delete.bind(teacherController));
router.patch('/:id/avatar', (0, role_middleware_1.authorizeRoles)('ADMIN'), upload_middleware_1.upload.single('avatar'), teacherController.uploadAvatar.bind(teacherController));
router.patch('/:id/assign-subjects', (0, role_middleware_1.authorizeRoles)('ADMIN'), teacherController.assignSubjects.bind(teacherController));
router.patch('/:id/assign-classes', (0, role_middleware_1.authorizeRoles)('ADMIN'), teacherController.assignClasses.bind(teacherController));
router.get('/:id/schedule', (0, role_middleware_1.authorizeRoles)('ADMIN', 'TEACHER'), teacherController.getSchedule.bind(teacherController));
router.get('/:id/dashboard', (0, role_middleware_1.authorizeRoles)('ADMIN', 'TEACHER'), teacherController.getDashboardStats.bind(teacherController));
exports.default = router;

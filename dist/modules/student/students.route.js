"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controllet_1 = require("./student.controllet");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const upload_middleware_1 = require("../../utils/upload.middleware");
const router = (0, express_1.Router)();
const studentController = new student_controllet_1.StudentController();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Student: view own profile
router.get('/me', (0, role_middleware_1.authorizeRoles)('STUDENT'), studentController.getMyProfile.bind(studentController));
// Admin / Teacher access
router.post('/', (0, role_middleware_1.authorizeRoles)('ADMIN'), studentController.create.bind(studentController));
router.get('/', (0, role_middleware_1.authorizeRoles)('ADMIN', 'TEACHER'), studentController.findAll.bind(studentController));
router.get('/:id', (0, role_middleware_1.authorizeRoles)('ADMIN', 'TEACHER'), studentController.findById.bind(studentController));
router.patch('/:id', (0, role_middleware_1.authorizeRoles)('ADMIN'), studentController.update.bind(studentController));
router.delete('/:id', (0, role_middleware_1.authorizeRoles)('ADMIN'), studentController.delete.bind(studentController));
router.patch('/:id/avatar', (0, role_middleware_1.authorizeRoles)('ADMIN'), upload_middleware_1.upload.single('avatar'), studentController.uploadAvatar.bind(studentController));
router.get('/:id/attendance', (0, role_middleware_1.authorizeRoles)('ADMIN', 'TEACHER'), studentController.getAttendanceSummary.bind(studentController));
router.get('/:id/results', (0, role_middleware_1.authorizeRoles)('ADMIN', 'TEACHER'), studentController.getResultSummary.bind(studentController));
exports.default = router;

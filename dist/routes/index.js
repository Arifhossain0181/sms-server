"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("../modules/auth/auth.route"));
const students_route_1 = __importDefault(require("../modules/student/students.route"));
const subject_router_1 = __importDefault(require("../modules/subject/subject.router"));
const class_route_1 = __importDefault(require("../modules/class/class.route"));
const exam_route_1 = __importDefault(require("../modules/exam/exam.route"));
const attendacne_router_1 = __importDefault(require("../modules/attendance/attendacne.router"));
const teacher_routes_1 = __importDefault(require("../modules/teachers/teacher.routes"));
const result_router_1 = __importDefault(require("../modules/result/result.router"));
const router = express_1.default.Router();
// Simple health check so the server has a default route
router.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is healthy' });
});
router.use('/auth', auth_route_1.default);
router.use('/students', students_route_1.default);
router.use('/subjects', subject_router_1.default);
router.use('/classes', class_route_1.default);
router.use('/exams', exam_route_1.default);
router.use('/attendance', attendacne_router_1.default);
router.use('/teachers', teacher_routes_1.default);
router.use('/results', result_router_1.default);
exports.default = router;

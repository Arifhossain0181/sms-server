import express from 'express';
import authRoutes from '../modules/auth/auth.route';
import studentRoutes from '../modules/student/students.route';
import subjectRoutes from '../modules/subject/subject.router';
import classRoutes from '../modules/class/class.route';
import examRoutes from '../modules/exam/exam.route';
import attendanceRoutes from '../modules/attendance/attendacne.router';
import teacherRoutes from '../modules/teachers/teacher.routes';

const router = express.Router();

// Simple health check so the server has a default route
router.get('/health', (req, res) => {
	res.status(200).json({ success: true, message: 'API is healthy' });
});

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/subjects', subjectRoutes);
router.use('/classes', classRoutes);
router.use('/exams', examRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/teachers', teacherRoutes);

export default router;

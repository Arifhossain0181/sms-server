import express from 'express';
import authRoutes from '../modules/auth/auth.route';
import studentRoutes from '../modules/student/students.route';
import subjectRoutes from '../modules/subject/subject.router';
import classRoutes from '../modules/class/class.route';
import examRoutes from '../modules/exam/exam.route';
import attendanceRoutes from '../modules/attendance/attendacne.router';
import teacherRoutes from '../modules/teachers/teacher.routes';
import resultRoutes from '../modules/result/result.router';
import admissionRoutes from '../modules/admission/admission.routes';
import feeRoutes from '../modules/fee/router';
import teachingApplicationRoutes from '../modules/teachingApplication/teachingApplication.routes';
import noticeRoutes from '../modules/notice/notice.route';
import timetableRoutes from '../modules/timetable/timetable.routes';
import parentRoutes from '../modules/parents/parents.routes';
import notificationRoutes from '../modules/notifiction/notifictaion.routes';
import homeworkRoutes from '../modules/homework/howework.routes';

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
router.use('/results', resultRoutes);
router.use('/admission', admissionRoutes);
router.use('/fees', feeRoutes);
router.use('/teaching', teachingApplicationRoutes);
router.use('/notices', noticeRoutes);
router.use('/timetable', timetableRoutes);
router.use('/homework', homeworkRoutes);
router.use('/parents', parentRoutes);
router.use('/notifications', notificationRoutes);


export default router;

import express from 'express';
import authRoutes from '../modules/auth/auth.route';
import studentRoutes from '../modules/student/students.route';

const router = express.Router();

// Simple health check so the server has a default route
router.get('/health', (req, res) => {
	res.status(200).json({ success: true, message: 'API is healthy' });
});

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);

export default router;

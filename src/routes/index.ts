import express from 'express';

const router = express.Router();

// Simple health check so the server has a default route
router.get('/health', (req, res) => {
	res.status(200).json({ success: true, message: 'API is healthy' });
});

export default router;

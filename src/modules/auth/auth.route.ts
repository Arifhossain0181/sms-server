import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
 
const router = Router();
const authController = AuthController;
 
// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
 
// Protected routes
router.use(authenticate);
router.get('/me', authController.getMe.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.patch('/change-password', authController.changePassword.bind(authController));
 
export default router;
 
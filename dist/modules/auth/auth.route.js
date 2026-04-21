"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = auth_controller_1.AuthController;
// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
// Protected routes
router.use(auth_middleware_1.authenticate);
router.get('/me', authController.getMe.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.patch('/change-password', authController.changePassword.bind(authController));
exports.default = router;

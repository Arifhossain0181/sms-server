"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_util_1 = require("../../utils/response.util");
const authService = new auth_service_1.AuthService();
exports.AuthController = {
    async register(req, res, next) {
        try {
            const user = await authService.register(req.body);
            res.status(201).json({
                success: true,
                data: user,
                message: "User Registered Successfully"
            });
        }
        catch (error) {
            next({
                status: 400,
                message: error instanceof Error ? error.message : "Registration Failed"
            });
        }
    },
    async login(req, res, next) {
        try {
            const data = await authService.login(req.body);
            res.status(200).json({
                success: true,
                data,
                message: "Login Successful"
            });
        }
        catch (error) {
            next({
                status: 400,
                message: error instanceof Error ? error.message : "Login Failed"
            });
        }
    },
    async refreshToken(req, res, next) {
        try {
            const data = await authService.refreshToken(req.body);
            res.status(200).json({
                success: true,
                data,
                message: "Token Refreshed Successfully"
            });
        }
        catch (error) {
            next({
                status: 400,
                message: error instanceof Error ? error.message : "Token Refresh Failed"
            });
        }
    },
    async logout(req, res, next) {
        try {
            await authService.logout(req.body);
            res.status(200).json({
                success: true,
                message: "Logout Successful"
            });
        }
        catch (error) {
            next({
                status: 400,
                message: error instanceof Error ? error.message : "Logout Failed"
            });
        }
    },
    async changePassword(req, res, next) {
        try {
            await authService.changePassword(req.user.id, req.body);
            (0, response_util_1.sendSuccess)(res, null, 'Password changed successfully');
        }
        catch (err) {
            next(err);
        }
    },
    async forgotPassword(req, res, next) {
        try {
            await authService.forgotPassword(req.body);
            (0, response_util_1.sendSuccess)(res, null, 'Reset link sent to your email');
        }
        catch (err) {
            next(err);
        }
    },
    async resetPassword(req, res, next) {
        try {
            await authService.resetPassword(req.body);
            (0, response_util_1.sendSuccess)(res, null, 'Password reset successfully');
        }
        catch (err) {
            next(err);
        }
    },
    async getMe(req, res, next) {
        try {
            const user = await authService.getme(req.user.id);
            (0, response_util_1.sendSuccess)(res, user, 'Profile fetched');
        }
        catch (err) {
            next(err);
        }
    }
};

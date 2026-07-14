import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response.util';

const authService = new AuthService();



function _setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
  };
  res.cookie('accessToken', accessToken, { ...base, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function _forward(next: NextFunction, error: unknown, fallbackMessage: string, fallbackStatus = 400) {
  const status = typeof error === 'object' && error && 'status' in error ? (error as any).status : fallbackStatus;
  const message = error instanceof Error ? error.message : fallbackMessage;
  next({ status, message });
}

export const AuthController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ success: true, data: user, message: 'User Registered Successfully' });
    } catch (error) {
      _forward(next, error, 'Registration Failed');
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.login(req.body);
      _setAuthCookies(res, data.accessToken, data.refreshToken);
      res.status(200).json({ success: true, data, message: 'Login Successful' });
    } catch (error) {
      _forward(next, error, 'Login Failed');
    }
  },

  async studentLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.studentLogin(req.body);
      _setAuthCookies(res, data.accessToken, data.refreshToken);
      res.status(200).json({ success: true, data, message: 'Student Login Successful' });
    } catch (error) {
      _forward(next, error, 'Student Login Failed');
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.refreshToken(req.body);
      _setAuthCookies(res, data.accessToken, data.refreshToken);
      res.status(200).json({ success: true, data, message: 'Token Refreshed Successfully' });
    } catch (error) {
      _forward(next, error, 'Token Refresh Failed', 401);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.id);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, message: 'Logout Successful' });
    } catch (error) {
      _forward(next, error, 'Logout Failed');
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.changePassword(req.user!.id, req.body);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (err) {
      _forward(next, err, 'Password Change Failed');
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body);
      
      sendSuccess(res, null, 'If that email is registered, a reset link has been sent');
    } catch (err) {
      _forward(next, err, 'Request Failed');
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (err) {
      _forward(next, err, 'Password Reset Failed');
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getme(req.user!.id);
      sendSuccess(res, user, 'Profile fetched');
    } catch (err) {
      _forward(next, err, 'Could Not Fetch Profile', 404);
    }
  },
};
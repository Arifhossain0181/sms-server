
import { Request, Response, NextFunction } from 'express';
import { AuthService,} from './auth.service';
import { sendSuccess } from '../../utils/response.util';
const authService = new AuthService();
export const AuthController ={
    async register(req:Request,res:Response ,next:NextFunction) {
        try{
            const user = await authService.register(req.body);
            res.status(201).json({
                success:true,
                data:user,
                message:"User Registered Successfully"
            });
        } catch (error) {
            next({
                status:400,
                message:error instanceof Error ? error.message : "Registration Failed"
            });
        }
    },

async   login(req:Request,res:Response ,next:NextFunction) {
      try{
        const data = await authService.login(req.body);
        res.status(200).json({
            success:true,
            data,
            message:"Login Successful"
        });
      }
        catch (error) {
            next({
                status:400,
                message:error instanceof Error ? error.message : "Login Failed"
            });
        }
},
async  refreshToken(req:Request,res:Response ,next:NextFunction) {
    try{
        const data = await authService.refreshToken(req.body);
        res.status(200).json({
            success:true,
            data,
            message:"Token Refreshed Successfully"
        });
    }
    catch (error) {
        next({
            status:400,
            message:error instanceof Error ? error.message : "Token Refresh Failed"
        });
}


}
, 
async logout(req:Request,res:Response ,next:NextFunction) {
    try{
        await authService.logout(req.body);
        res.status(200).json({
            success:true,
            message:"Logout Successful"
        });
    }
    catch (error) {
        next({
            status:400,
            message:error instanceof Error ? error.message : "Logout Failed"
        });
    }
} ,
 async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.changePassword(req.user!.id, req.body);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  },
 
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body);
      sendSuccess(res, null, 'Reset link sent to your email');
    } catch (err) {
      next(err);
    }
  },
 
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (err) {
      next(err);
    }
  },
 
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getme(req.user!.id);
      sendSuccess(res, user, 'Profile fetched');
    } catch (err) {
      next(err);
    }
  }
}
    
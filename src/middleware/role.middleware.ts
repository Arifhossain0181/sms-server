import { Request, Response, NextFunction } from 'express';
export const authorizeRoles = (...roles: string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        if(!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
        }
        next();
    }
}
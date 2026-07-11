import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
export const authorizeRoles = (...roles: string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        if(!req.user) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
        }
        
        if (!roles.includes(req.user.role)) {
            logger.warn(`[ROLE] Access denied - User ${req.user.role}, required [${roles.join(', ')}]`);
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
        }
        
        next();
    }
}
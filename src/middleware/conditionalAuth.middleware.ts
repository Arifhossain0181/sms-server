import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const authorizeRolesOrSelf = (allowedRoles: string[], paramKey: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: You do not have the required role to access this resource' 
      });
    }

    const requestedId = Array.isArray(req.params[paramKey]) 
      ? req.params[paramKey][0] 
      : req.params[paramKey];

    // Allow if user has required role
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // যদি STUDENT হয় এবং নিজের attendance দেখতে চায় তাহলে allow করুন
    if (req.user.role === 'STUDENT' && req.user.studentId === requestedId) {
      return next();
    }

    logger.warn(`[CONDITIONAL-AUTH] Access denied - User ${req.user.id} (${req.user.role}) -> ${requestedId}`);
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: You do not have the required role to access this resource' 
    });
  };
};

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const normalizeRole = (value?: string) =>
  String(value ?? '')
    .trim()
    .replace(/[-_\s]+/g, '_')
    .toUpperCase();

export const authorizeRolesOrSelf = (allowedRoles: string[], paramKey: string = 'id') => {
  const allowedSet = new Set(allowedRoles.map(normalizeRole));

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

    const userRole = normalizeRole(req.user.role);

    // Allow if user has required role
    if (allowedSet.has(userRole)) {
      return next();
    }

    // যদি STUDENT হয় এবং নিজের attendance দেখতে চায় তাহলে allow করুন
    if (userRole === 'STUDENT' && req.user.studentId === requestedId) {
      return next();
    }

    logger.warn(`[CONDITIONAL-AUTH] Access denied - User ${req.user.id} (${req.user.role}) -> ${requestedId}`);
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: You do not have the required role to access this resource' 
    });
  };
};

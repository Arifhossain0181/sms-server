import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const normalizeRole = (value?: string) =>
    String(value ?? '')
        .trim()
        .replace(/[-_\s]+/g, '_')
        .toUpperCase();

export const authorizeRoles = (...roles: string[]) => {
    const allowedRoles = new Set(roles.map(normalizeRole));

    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
        }

        const userRole = normalizeRole(req.user.role);

        if (!allowedRoles.has(userRole)) {
            logger.warn(`[ROLE] Access denied - User ${req.user.role}, required [${roles.join(', ')}]`);
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
        }

        next();
    }
};
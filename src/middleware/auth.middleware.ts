import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import logger from '../utils/logger';
import prisma from '../config/db';

export const authenticate = async (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    logger.debug(`[AUTH] Authenticating: ${req.method} ${req.path}`);

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.headers.cookie) {
        const match = req.headers.cookie.match(/(?:^|; )accessToken=([^;]+)/);
        token = match?.[1];
    }

    if (!token) {
        return res.status(401).json({success: false, message: 'Unauthorized' });
    }

    // Here you would typically verify the token and extract user information
    const decoded = verifyAccessToken(token);
    if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid token or expired token ' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, schoolId: true, isActive: true, school: { select: { isActive: true } } },
        });

        if (!user || !user.isActive || (user.schoolId && !user.school?.isActive)) {
            return res.status(401).json({ success: false, message: 'Account or school is inactive' });
        }

        if ((decoded.schoolId ?? null) !== (user.schoolId ?? null)) {
            return res.status(401).json({ success: false, message: 'Session is no longer valid' });
        }

        req.user = { ...decoded, id: user.id, role: user.role, schoolId: user.schoolId };
        (req as any).schoolId = user.schoolId ?? undefined;
        next();
    } catch (error) {
        next(error);
    }
}
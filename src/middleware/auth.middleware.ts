import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
export const authenticate = (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

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
    req.user = decoded; // Attach user info to request object
    next();
}
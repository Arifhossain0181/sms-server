import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
export const authenticate = (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({success: false, message: 'Unauthorized' });
    
    } 
    const token = authHeader.split(' ')[1];
    // Here you would typically verify the token and extract user information 
    const decoded = verifyAccessToken(token);
    if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid token or expired token ' });
    }
    req.user = decoded; // Attach user info to request object
    next();
}
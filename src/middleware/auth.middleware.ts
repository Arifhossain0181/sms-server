import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
export const authenticate = (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    console.log(`\n[AUTH] Authenticating: ${req.method} ${req.path}`);
    console.log(`[AUTH] Authorization header:`, authHeader ? authHeader.substring(0, 30) + '...' : 'Missing');
    console.log(`[AUTH] Cookies present:`, req.headers.cookie ? 'Yes' : 'No');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log(`[AUTH] ✅ Token from Authorization header (length: ${token.length})`);
    } else if (req.headers.cookie) {
        const match = req.headers.cookie.match(/(?:^|; )accessToken=([^;]+)/);
        token = match?.[1];
        console.log(`[AUTH] Token from Cookie:`, token ? `✅ Found (length: ${token.length})` : '❌ Not found');
    } else {
        console.log(`[AUTH] ❌ No Authorization header or cookies found`);
    }

    if (!token) {
        console.log(`[AUTH] ❌ No token found - Returning 401`);
        return res.status(401).json({success: false, message: 'Unauthorized' });
    }

    console.log(`[AUTH] Token to verify: ${token.substring(0, 30)}...`);
    
    // Here you would typically verify the token and extract user information 
    const decoded = verifyAccessToken(token);
    if (!decoded) {
        console.log(`[AUTH] ❌ Token verification failed`);
        return res.status(401).json({ success: false, message: 'Invalid token or expired token ' });
    }

    console.log(`[AUTH] ✅ Token verified for user: ${decoded.email} (${decoded.role})`);
    if (decoded.studentId) {
        console.log(`[AUTH] ✅ Student ID: ${decoded.studentId}`);
    }
    
    req.user = decoded; // Attach user info to request object
    next();
}
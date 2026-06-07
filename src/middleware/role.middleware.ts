import { Request, Response, NextFunction } from 'express';
export const authorizeRoles = (...roles: string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        if(!req.user) {
            console.log(`[ROLE] ❌ No user found in request`);
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
        }
        
        console.log(`[ROLE] Checking access - User role: ${req.user.role}, Required: [${roles.join(', ')}]`);
        
        if (!roles.includes(req.user.role)) {
            console.log(`[ROLE] ❌ Access denied - Role not in allowed list`);
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
        }
        
        console.log(`[ROLE] ✅ Access granted`);
        next();
    }
}
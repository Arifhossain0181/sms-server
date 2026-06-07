import { Request, Response, NextFunction } from 'express';

export const authorizeRolesOrSelf = (allowedRoles: string[], paramKey: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log(`[CONDITIONAL-AUTH] ❌ No user found in request`);
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: You do not have the required role to access this resource' 
      });
    }

    const requestedId = Array.isArray(req.params[paramKey]) 
      ? req.params[paramKey][0] 
      : req.params[paramKey];

    console.log(`[CONDITIONAL-AUTH] User role: ${req.user.role}, User ID: ${req.user.id}, Student ID: ${req.user.studentId}, Requested ID: ${requestedId}`);
    console.log(`[CONDITIONAL-AUTH] Allowed roles: [${allowedRoles.join(', ')}]`);

    // Allow if user has required role
    if (allowedRoles.includes(req.user.role)) {
      console.log(`[CONDITIONAL-AUTH] ✅ Access granted - User has allowed role`);
      return next();
    }

    // যদি STUDENT হয় এবং নিজের attendance দেখতে চায় তাহলে allow করুন
    if (req.user.role === 'STUDENT' && req.user.studentId === requestedId) {
      console.log(`[CONDITIONAL-AUTH] ✅ Access granted - Student accessing own data`);
      return next();
    }

    console.log(`[CONDITIONAL-AUTH] ❌ Access denied - No matching access criteria`);
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: You do not have the required role to access this resource' 
    });
  };
};

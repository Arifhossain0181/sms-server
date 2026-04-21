"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    // Here you would typically verify the token and extract user information 
    const decoded = (0, jwt_util_1.verifyAccessToken)(token);
    if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid token or expired token ' });
    }
    req.user = decoded; // Attach user info to request object
    next();
};
exports.authenticate = authenticate;

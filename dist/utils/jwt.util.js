"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const generateAccessToken = (payload) => {
    if (!accessSecret) {
        throw new Error('JWT_ACCESS_SECRET is not configured');
    }
    return jsonwebtoken_1.default.sign(payload, accessSecret, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    if (!refreshSecret) {
        throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    return jsonwebtoken_1.default.sign(payload, refreshSecret, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;

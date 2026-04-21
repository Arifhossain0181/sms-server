"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const jwt_util_1 = require("../../utils/jwt.util");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_crypto_1 = require("node:crypto");
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async ({ to, subject, text }) => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) {
        throw new Error("SMTP credentials are not configured");
    }
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user, pass }
    });
    await transporter.sendMail({
        from: process.env.SMTP_FROM || user,
        to,
        subject,
        text
    });
};
class AuthService {
    async register(dto) {
        const existing = await db_1.default.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (existing) {
            throw new Error("User already Registered");
        }
        // Continue with user creation logic 
        const hashedPassword = await bcryptjs_1.default.hash(dto.password, 10);
        const user = await db_1.default.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: hashedPassword,
                role: dto.role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        return user;
    }
    async login(dto) {
        const user = await db_1.default.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isMatch = await bcryptjs_1.default.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }
        const accessToken = (0, jwt_util_1.generateAccessToken)({
            id: user.id,
            email: user.email,
            role: user.role
        });
        const refreshToken = (0, jwt_util_1.generateRefreshToken)({
            id: user.id,
            email: user.email,
            role: user.role
        });
        // Rotate refresh token so each user keeps only one active token record.
        await db_1.default.$transaction([
            db_1.default.refreshToken.deleteMany({
                where: {
                    userId: user.id
                }
            }),
            db_1.default.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            })
        ]);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }
    async refreshToken(dto) {
        const payload = (0, jwt_util_1.verifyRefreshToken)(dto.refreshToken);
        const user = await db_1.default.user.findUnique({
            where: {
                id: payload.id
            }
        });
        const storedToken = await db_1.default.refreshToken.findFirst({
            where: {
                userId: user?.id,
                token: dto.refreshToken,
                expiresAt: {
                    gte: new Date()
                }
            }
        });
        if (!user || !storedToken) {
            throw new Error("Invalid refresh token");
        }
        const accessToken = (0, jwt_util_1.generateAccessToken)({
            id: user.id,
            email: user.email,
            role: user.role
        });
        const newRefreshToken = (0, jwt_util_1.generateRefreshToken)({
            id: user.id,
            email: user.email,
            role: user.role
        });
        await db_1.default.$transaction([
            db_1.default.refreshToken.deleteMany({
                where: {
                    userId: user.id
                }
            }),
            db_1.default.refreshToken.create({
                data: {
                    token: newRefreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            })
        ]);
        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    }
    async logout(userId) {
        await db_1.default.refreshToken.deleteMany({
            where: {
                userId
            }
        });
    }
    async changePassword(userId, dto) {
        const user = await db_1.default.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new Error("User not found");
        }
        const isMatch = await bcryptjs_1.default.compare(dto.oldPassword, user.passwordHash);
        if (!isMatch) {
            throw new Error("Old password is incorrect");
        }
        const hashed = await bcryptjs_1.default.hash(dto.newPassword, 10);
        await db_1.default.user.update({
            where: {
                id: userId
            },
            data: {
                passwordHash: hashed
            }
        });
    }
    async forgotPassword(dto) {
        const user = await db_1.default.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user) {
            throw new Error("User not found");
        }
        const token = (0, node_crypto_1.randomBytes)(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
        await db_1.default.passwordReset.create({
            data: {
                userId: user.id,
                otp: token,
                expiresAt,
                used: false
            }
        });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`
        });
    }
    async resetPassword(dto) {
        const resetRequest = await db_1.default.passwordReset.findFirst({
            where: {
                otp: dto.token,
                used: false,
                expiresAt: {
                    gte: new Date()
                }
            }
        });
        if (!resetRequest) {
            throw new Error("Invalid or expired reset token");
        }
        const hashed = await bcryptjs_1.default.hash(dto.newPassword, 10);
        await db_1.default.$transaction([
            db_1.default.user.update({
                where: {
                    id: resetRequest.userId
                },
                data: {
                    passwordHash: hashed
                }
            }),
            db_1.default.passwordReset.update({
                where: {
                    id: resetRequest.id
                },
                data: {
                    used: true
                }
            })
        ]);
    }
    async getme(userId) {
        const user = await db_1.default.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
}
exports.AuthService = AuthService;

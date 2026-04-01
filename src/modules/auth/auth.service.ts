import prisma from "../../config/db";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.util";
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResetPasswordDto } from "./auth.dto";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }: { to: string; subject: string; text: string }) => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        throw new Error("SMTP credentials are not configured");
    }

    const transporter = nodemailer.createTransport({
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


export class AuthService {
    async register(dto:RegisterDto) {
        const existing = await prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });

        if (existing) {
            throw new Error("User already Registered");
        }

        // Continue with user creation logic 
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: hashedPassword,
                role:dto.role
            },
            select:{
                id:true,
                name:true,
                email:true,
                role:true ,
                isActive:true,
                createdAt:true
            }
        })
        return user;

    }

    async login(dto: LoginDto){
        const user = await prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role
        });
        const refreshToken = generateRefreshToken({
            id: user.id,
            email: user.email,
            role: user.role
        });
        // Rotate refresh token so each user keeps only one active token record.
        await prisma.$transaction([
            prisma.refreshToken.deleteMany({
                where: {
                    userId: user.id
                }
            }),
            prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            })
        ]);
        return {
            accessToken,
            refreshToken ,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    }
    async refreshToken(dto:RefreshTokenDto){

        const payload = verifyRefreshToken(dto.refreshToken)
        const user = await prisma.user.findUnique({
            where: {
                id: payload.id
    }
        })
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                userId: user?.id,
                token: dto.refreshToken,
                expiresAt: {
                    gte: new Date()
                }
            }
        });

        if(!user || !storedToken){
            throw new Error("Invalid refresh token");
        }
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role
        })
        const newRefreshToken = generateRefreshToken({
            id: user.id,
            email: user.email,
            role: user.role
        })
        await prisma.$transaction([
            prisma.refreshToken.deleteMany({
                where: {
                    userId: user.id
                }
            }),
            prisma.refreshToken.create({
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
        }
    }

    async logout(userId: string){
        await prisma.refreshToken.deleteMany({
            where: {
                userId
            }
        })
    }

    async changePassword (userId:string , dto:ChangePasswordDto){
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new Error("User not found");
        }
        const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
        if (!isMatch) {
            throw new Error("Old password is incorrect");
        }
        const hashed = await bcrypt.hash(dto.newPassword, 10);
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                passwordHash: hashed
            }
        })
    }
    async forgotPassword(dto:ForgotPasswordDto){
        const user = await prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user) {
            throw new Error("User not found");
        }
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

        await prisma.passwordReset.create({
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
        })
        

    }
    async resetPassword  (dto:ResetPasswordDto){
        const resetRequest = await prisma.passwordReset.findFirst({
            where:{
                otp: dto.token,
                used: false,
                expiresAt: {
                    gte: new Date() 
                }
            }
        })
        if (!resetRequest) {
            throw new Error("Invalid or expired reset token");
        }
        const hashed = await bcrypt.hash(dto.newPassword, 10);
        await prisma.$transaction([
            prisma.user.update({
                where: {
                    id: resetRequest.userId
                },
                data: {
                    passwordHash: hashed
                }
            }),
            prisma.passwordReset.update({
                where: {
                    id: resetRequest.id
                },
                data: {
                    used: true
                }
            })
        ]);
    }
    async getme(userId:string){
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select:{
                id:true,
                name:true,
                email:true,
                role:true ,
                isActive:true,
                createdAt:true
            }
        })
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    
}
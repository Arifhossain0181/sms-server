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



const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
} as const;

export class AuthService {

    // ─── PRIVATE: one shared token-issuing path for every login flow ──
    private async _issueTokens(user: {
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        studentProfile?: { id: string } | null;
    }) {
        if (!user.isActive) {
            throw new Error("Your account has been deactivated");
        }

        const tokenPayload: any = { id: user.id, email: user.email, role: user.role };
        if (user.role === 'STUDENT' && user.studentProfile?.id) {
            tokenPayload.studentId = user.studentProfile.id;
        }

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Rotate refresh token so each user keeps only one active token record.
        await prisma.$transaction([
            prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
            prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            }),
        ]);

        return { accessToken, refreshToken };
    }

    // ─── PRIVATE: write one AuditLog row, never let logging break the flow ─
    private async _logAudit(userId: string, action: string, metadata?: Record<string, any>) {
        try {
            await prisma.auditLog.create({
                data: { userId, action, targetType: 'User', targetId: userId, metadata },
            });
        } catch {
            // WHAT: audit logging must never crash the actual request.
            // A logging failure is a monitoring problem, not a reason to
            // fail someone's login/password-change.
        }
    }

    async register(dto: RegisterDto) {
        const existing = await prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new Error("User already Registered");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: hashedPassword,
                role: dto.role,
            },
            select: USER_SELECT,
        });

        await this._logAudit(user.id, 'REGISTER', { role: dto.role });
        return user;
    }

    async login(dto: LoginDto) {
        const user = await prisma.user.findUnique({
            where: { email: dto.email },
            include: { studentProfile: true },
        });
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }

        // isActive is checked inside _issueTokens() — applies to every flow.
        const { accessToken, refreshToken } = await this._issueTokens(user);
        await this._logAudit(user.id, 'LOGIN');

        return {
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        };
    }

    async refreshToken(dto: RefreshTokenDto) {
        const payload = verifyRefreshToken(dto.refreshToken);
        if (!payload) {
            const err = new Error("Invalid refresh token");
            (err as any).status = 401;
            throw err;
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            include: { studentProfile: true },
        });
        // WHAT: short-circuit here instead of querying refreshToken with a
        // possibly-undefined userId filter first.
        if (!user) {
            const err = new Error("Invalid refresh token");
            (err as any).status = 401;
            throw err;
        }

        const storedToken = await prisma.refreshToken.findFirst({
            where: { userId: user.id, token: dto.refreshToken, expiresAt: { gte: new Date() } },
        });
        if (!storedToken) {
            const err = new Error("Invalid refresh token");
            (err as any).status = 401;
            throw err;
        }

        const { accessToken, refreshToken } = await this._issueTokens(user);
        return { accessToken, refreshToken };
    }

    async logout(userId: string) {
        await prisma.refreshToken.deleteMany({ where: { userId } });
        await this._logAudit(userId, 'LOGOUT');
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
        if (!isMatch) {
            throw new Error("Old password is incorrect");
        }
        const hashed = await bcrypt.hash(dto.newPassword, 10);

        // WHAT: update password AND revoke every existing session in one
        // transaction — a stolen refresh token becomes useless the moment
        // the real owner changes their password.
        await prisma.$transaction([
            prisma.user.update({ where: { id: userId }, data: { passwordHash: hashed } }),
            prisma.refreshToken.deleteMany({ where: { userId } }),
        ]);

        await this._logAudit(userId, 'CHANGE_PASSWORD');
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            // WHAT: don't reveal whether an email is registered — return
            // silently instead of throwing "User not found".
            // WHY: throwing here lets an attacker enumerate valid emails
            // by watching which addresses error out on this endpoint.
            return;
        }

        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

        await prisma.passwordReset.create({
            data: { userId: user.id, otp: token, expiresAt, used: false },
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        });

        await this._logAudit(user.id, 'FORGOT_PASSWORD_REQUEST');
    }

    async resetPassword(dto: ResetPasswordDto) {
        const resetRequest = await prisma.passwordReset.findFirst({
            where: { otp: dto.token, used: false, expiresAt: { gte: new Date() } },
        });
        if (!resetRequest) {
            throw new Error("Invalid or expired reset token");
        }

        const hashed = await bcrypt.hash(dto.newPassword, 10);

        // WHAT: same as changePassword() — revoke all sessions on reset too.
        await prisma.$transaction([
            prisma.user.update({ where: { id: resetRequest.userId }, data: { passwordHash: hashed } }),
            prisma.passwordReset.update({ where: { id: resetRequest.id }, data: { used: true } }),
            prisma.refreshToken.deleteMany({ where: { userId: resetRequest.userId } }),
        ]);

        await this._logAudit(resetRequest.userId, 'RESET_PASSWORD');
    }

    async getme(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: USER_SELECT });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async studentLogin(dto: LoginDto) {
        const user = await prisma.user.findUnique({
            where: { email: dto.email },
            include: { studentProfile: { include: { admissionRecord: true } } },
        });
        if (!user) {
            throw new Error("Invalid email or password");
        }
        if (!user.isActive) {
            throw new Error("Your account is deactivated. Please contact admin.");
        }
        if (user.role !== 'STUDENT') {
            throw new Error("This account is not a student account");
        }
        if (!user.studentProfile) {
            throw new Error("Student profile not found");
        }

        const admission = user.studentProfile.admissionRecord;
        if (!admission || admission.status !== 'APPROVED') {
            throw new Error("Your admission is not verified yet. Please wait for admin approval.");
        }

        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }

        // isActive is checked inside _issueTokens() — same as login().
        const { accessToken, refreshToken } = await this._issueTokens(user);
        await this._logAudit(user.id, 'STUDENT_LOGIN');

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentProfile.studentId,
                studentClass: user.studentProfile.classId,
            },
        };
    }
}
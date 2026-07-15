import prisma from "../../config/db";
import { AdmissionQueryDto, CreateAdmissionDto, UpdateAdmissionDto, UpdateAdmissionStatusDto, ConvertToStudentDto } from "./admission.dto";
import { mailService } from "../../config/mail";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const MAX_PAGE_LIMIT = 100;

export class AdmissionService {
    async create(dto: CreateAdmissionDto) {
        const classExists = await prisma.class.findUnique({
            where: { id: dto.targetClassId },
        });
        if (!classExists) throw new Error("Class not found");

        // FIX: only studentEmail should block duplicates — guardianEmail is
        // shared across siblings (Parent Req 1.2: multi-child accounts must work)
        const existing = await prisma.admissionApplication.findFirst({
            where: { studentEmail: dto.studentEmail },
        });
        if (existing) {
            throw new Error("An application with this student email already exists");
        }

        return prisma.admissionApplication.create({
            data: {
                applicantName: dto.applicantName,
                studentEmail: dto.studentEmail,
                dob: new Date(dto.dob),
                gender: dto.gender,
                religion: dto.religion,
                bloodGroup: dto.bloodGroup,
                address: dto.address,
                guardianName: dto.guardianName,
                guardianPhone: dto.guardianPhone,
                guardianEmail: dto.guardianEmail,
                targetClassId: dto.targetClassId,
                photoUrl: dto.photoUrl,
                birthCertUrl: dto.birthCertUrl,
                status: "PENDING",
                paymentMethod: dto.paymentMethod,
                paymentAmount: dto.paymentAmount,
                transactionId: dto.transactionId,
                paymentStatus: dto.paymentAmount ? "PAID" : "PENDING",
                paymentDate: dto.paymentAmount ? new Date() : undefined,
            },
            include: {
                targetClass: { select: { name: true, numericLevel: true } },
            },
        });
    }

    async findAll(query: AdmissionQueryDto) {
        const page = Math.max(Number(query.page) || 1, 1);
        // FIX: cap limit so nobody can request the whole table in one call
        const limit = Math.min(Number(query.limit) || 10, MAX_PAGE_LIMIT);
        const skip = (page - 1) * limit;

        const where: any = {
            ...(query.status && { status: query.status }),
            ...(query.classId && { targetClassId: query.classId }),
            ...(query.search && {
                OR: [
                    { applicantName: { contains: query.search, mode: "insensitive" } },
                    { guardianName: { contains: query.search, mode: "insensitive" } },
                    { guardianPhone: { contains: query.search, mode: "insensitive" } },
                    { guardianEmail: { contains: query.search, mode: "insensitive" } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            prisma.admissionApplication.findMany({
                where,
                skip,
                take: limit,
                include: { targetClass: { select: { name: true, numericLevel: true } } },
                orderBy: { createdAt: "desc" },
            }),
            prisma.admissionApplication.count({ where }),
        ]);

        return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    async findById(id: string) {
        const admission = await prisma.admissionApplication.findUnique({
            where: { id },
            include: { targetClass: true },
        });
        if (!admission) throw new Error("Admission not found");
        return admission;
    }

    async update(id: string, dto: UpdateAdmissionDto) {
        await this._exists(id);
        return prisma.admissionApplication.update({
            where: { id },
            data: {
                applicantName: dto.applicantName,
                ...(dto.studentEmail && { studentEmail: dto.studentEmail }),
                ...(dto.dob && { dob: new Date(dto.dob) }),
                gender: dto.gender,
                religion: dto.religion,
                bloodGroup: dto.bloodGroup,
                address: dto.address,
                guardianName: dto.guardianName,
                guardianPhone: dto.guardianPhone,
                guardianEmail: dto.guardianEmail,
                targetClassId: dto.targetClassId,
                photoUrl: dto.photoUrl,
                birthCertUrl: dto.birthCertUrl,
            },
        });
    }

    async updateStatus(id: string, dto: UpdateAdmissionStatusDto, actorUserId: string) {
        const before = await this._exists(id);

        const admission = await prisma.admissionApplication.update({
            where: { id },
            data: {
                status: dto.status,
                rejectionReason: dto.rejectionReason,
                reviewedAt: new Date(),
            },
        });

        // NFR - Auditability: log every status change with who/when/what.
        // Assumes an AuditLog model exists in the foundation schema.
        await this._audit(actorUserId, "ADMISSION_STATUS_CHANGE", id, {
            from: before.status,
            to: dto.status,
            rejectionReason: dto.rejectionReason,
        });

        if (dto.status === "APPROVED" && !admission.studentId) {
            const studentProfile = await this.createStudentFromAdmission(admission.id);
            const updatedAdmission = await prisma.admissionApplication.findUnique({ where: { id } });
            return updatedAdmission || { ...admission, studentId: studentProfile?.id };
        }

        return admission;
    }

    async convertToStudent(_dto: ConvertToStudentDto) {
        throw new Error("Convert to student is not implemented yet");
    }

    async delete(id: string, actorUserId: string) {
        await this._exists(id);
        const deleted = await prisma.admissionApplication.delete({ where: { id } });
        await this._audit(actorUserId, "ADMISSION_DELETE", id, {});
        return deleted;
    }

    async getStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            prisma.admissionApplication.count(),
            prisma.admissionApplication.count({ where: { status: "PENDING" } }),
            prisma.admissionApplication.count({ where: { status: "APPROVED" } }),
            prisma.admissionApplication.count({ where: { status: "REJECTED" } }),
        ]);

        return { total, pending, approved, rejected };
    }

    async getPublicClasses() {
        return prisma.class.findMany({
            select: { id: true, name: true, numericLevel: true },
            orderBy: { numericLevel: "asc" },
        });
    }

    async getApplicationsByEmail(email: string) {
        return prisma.admissionApplication.findMany({
            where: {
                OR: [{ studentEmail: email }, { guardianEmail: email }],
            },
            select: {
                id: true,
                applicantName: true,
                studentEmail: true,
                status: true,
                paymentStatus: true,
                rejectionReason: true,
                createdAt: true,
                targetClass: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    private async _exists(id: string) {
        const admission = await prisma.admissionApplication.findUnique({ where: { id } });
        if (!admission) throw new Error("Admission record not found");
        return admission;
    }

    private async _audit(userId: string, action: string, targetId: string, meta: Record<string, unknown>) {
        try {
            await prisma.auditLog.create({
                data: { userId, action, targetId, meta: meta as any, timestamp: new Date() },
            });
        } catch (err) {
            // Audit logging must never break the main flow — just log locally.
            console.warn("Audit log failed:", (err as any)?.message);
        }
    }

   
    private async createStudentFromAdmission(admissionId: string) {
        return prisma.$transaction(
            async (tx) => {
                const admission = await tx.admissionApplication.findUnique({ where: { id: admissionId } });
                if (!admission) throw new Error("Admission record not found");
                if (admission.studentId) return admission;

                const studentEmail = admission.studentEmail;
                if (!studentEmail) throw new Error("Student email is required to create account");

                let user = await tx.user.findUnique({ where: { email: studentEmail } });
                let tempPassword: string | null = null;

                if (!user) {
                    tempPassword = randomBytes(6).toString("hex").toUpperCase();
                    const passwordHash = await bcrypt.hash(tempPassword, 10);

                    user = await tx.user.create({
                        data: {
                            name: admission.applicantName,
                            email: studentEmail,
                            passwordHash,
                            role: "STUDENT",
                        },
                    });
                }

                //  pick the section that still has room, not just the
                // alphabetically-first one (Req 1.5 — capacity limits).
                const sections = await tx.section.findMany({
                    where: { classId: admission.targetClassId },
                    include: { _count: { select: { students: true } } },
                    orderBy: { name: "asc" },
                });
                const section = sections.find((s) => s._count.students < s.maxCapacity);
                    if (!section) throw new Error("No available section with capacity for this class");

                const rollAggregate = await tx.student.aggregate({
                    where: { sectionId: section.id },
                    _max: { rollNumber: true },
                });
                const nextRoll = (rollAggregate._max.rollNumber ?? 0) + 1;

                const studentId = `STD-${randomBytes(4).toString("hex").toUpperCase()}`;

                let studentProfile = await tx.student.findFirst({ where: { userId: user.id } });
                if (!studentProfile) {
                    studentProfile = await tx.student.create({
                        data: {
                            studentId,
                            name: admission.applicantName,
                            dob: admission.dob,
                            gender: admission.gender,
                            bloodGroup: admission.bloodGroup,
                            religion: admission.religion,
                            address: admission.address,
                            photo: admission.photoUrl,
                            rollNumber: nextRoll,
                            classId: admission.targetClassId,
                            sectionId: section.id,
                            userId: user.id,
                        },
                    });
                }

                // 2) PARENT / GUARDIAN account is auto-provisioned here on
                //    approval — the parent does NOT self sign-up. The school
                //    account is created and credentials are emailed. Siblings
                //    share one parent account (guardianEmail is reused), so
                //    we only link the student to the existing parent when one
                //    already exists (Req 1.2: multi-child accounts must work).
                const parentResult = await this._ensureParentFromAdmission(tx, admission);
                if (parentResult && !studentProfile.parentId) {
                    studentProfile = await tx.student.update({
                        where: { id: studentProfile.id },
                        data: { parentId: parentResult.parent.id },
                    });
                }

                await tx.admissionApplication.update({
                    where: { id: admission.id },
                    data: { studentId: studentProfile.id },
                });

                // Return tempPassword only inside the tx scope so the caller
                // can send the welcome email AFTER commit — see below.
                return {
                    ...studentProfile,
                    __tempPassword: tempPassword,
                    __email: studentEmail,
                    __guardianName: admission.guardianName,
                    __parentTempPassword: parentResult?.tempPassword ?? null,
                    __parentEmail: parentResult?.email ?? null,
                };
            },
            { isolationLevel: "Serializable" }
        ).then(async (result: any) => {
            // FIX: email is fired after the transaction commits, and is
            // non-blocking — approval should not wait on SMTP (NFR: 3s page loads).
            // FIX: temp password is no longer console.logged (security leak).
            const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;
            if (result.__tempPassword) {
                mailService
                    .sendStudentCredentials(result.__email, result.name, result.__tempPassword, loginUrl)
                    .catch((err) => console.warn("Student welcome email failed:", err?.message));
            }
            if (result.__parentTempPassword) {
                mailService
                    .sendParentCredentials(
                        result.__parentEmail,
                        result.__guardianName,
                        result.name,
                        result.__parentTempPassword,
                        loginUrl,
                    )
                    .catch((err) => console.warn("Parent welcome email failed:", err?.message));
            }
            return result;
        });
    }

    // Creates (or reuses) the guardian's User + Parent account and returns
    // it. Reuses an existing parent account when the guardianEmail already
    // has one (multi-child families). Returns null when no guardianEmail.
    private async _ensureParentFromAdmission(tx: any, admission: any) {
        const guardianEmail = admission.guardianEmail;
        if (!guardianEmail) return null;

        // Reuse existing parent account (siblings share one guardian email).
        const existingParent = await tx.parent.findFirst({
            where: { user: { email: guardianEmail } },
        });
        if (existingParent) {
            return { parent: existingParent, email: guardianEmail, tempPassword: null };
        }

        // Reuse an existing user (no parent profile yet) or create a new one.
        let user = await tx.user.findUnique({ where: { email: guardianEmail } });
        let tempPassword: string | null = null;

        if (!user) {
            tempPassword = randomBytes(6).toString("hex").toUpperCase();
            const passwordHash = await bcrypt.hash(tempPassword, 10);
            user = await tx.user.create({
                data: {
                    name: admission.guardianName,
                    email: guardianEmail,
                    passwordHash,
                    role: "PARENT",
                },
            });
        }

        const parent = await tx.parent.create({
            data: {
                userId: user.id,
                name: admission.guardianName,
                phone: admission.guardianPhone,
                address: admission.address,
                relation: "Guardian",
            },
        });

        return { parent, email: guardianEmail, tempPassword };
    }
}
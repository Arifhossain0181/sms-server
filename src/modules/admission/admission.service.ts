import prisma from "../../config/db";
import { AdmissionQueryDto, CreateAdmissionDto, UpdateAdmissionDto, UpdateAdmissionStatusDto, ConvertToStudentDto, isValidGmailAddress } from "./admission.dto";
import { mailService } from "../../config/mail";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const MAX_PAGE_LIMIT = 100;

export class AdmissionService {
    async create(dto: CreateAdmissionDto) {
        const dob = new Date(dto.dob);
        const minimumDob = new Date();
        minimumDob.setFullYear(minimumDob.getFullYear() - 3);
        if (Number.isNaN(dob.getTime()) || dob > minimumDob) {
            const err = new Error("Student must be at least 3 years old");
            (err as any).status = 400;
            throw err;
        }
        if (!dto.birthCertUrl) {
            const err = new Error("Birth certificate is required");
            (err as any).status = 400;
            throw err;
        }
        if (!isValidGmailAddress(dto.guardianEmail)) {
            const err = new Error("Guardian email must be a valid Gmail address (example@gmail.com)");
            (err as any).status = 400;
            throw err;
        }

        const classExists = await prisma.class.findUnique({
            where: { id: dto.targetClassId },
        });
        if (!classExists) {
            const err = new Error("Class not found");
            (err as any).status = 404;
            throw err;
        }

        // FIX: only studentEmail should block duplicates — guardianEmail is
        // shared across siblings (Parent Req 1.2: multi-child accounts must work)
        const existing = await prisma.admissionApplication.findFirst({
            where: { studentEmail: dto.studentEmail },
        });
        if (existing) {
            const err = new Error("An application with this student email already exists");
            (err as any).status = 409;
            throw err;
        }

        return prisma.admissionApplication.create({
            data: {
                applicantName: dto.applicantName,
                studentEmail: dto.studentEmail.trim().toLowerCase(),
                studentPhone: dto.studentPhone.trim(),
                dob,
                gender: dto.gender,
                religion: dto.religion,
                bloodGroup: dto.bloodGroup,
                address: dto.address,
                presentHouseRoad: dto.presentHouseRoad,
                presentArea: dto.presentArea,
                presentCity: dto.presentCity,
                presentDistrict: dto.presentDistrict,
                presentPostalCode: dto.presentPostalCode,
                guardianName: dto.guardianName,
                guardianPhone: dto.guardianPhone,
                guardianEmail: dto.guardianEmail.trim().toLowerCase(),
                guardianRelation: dto.guardianRelation,
                fatherFullName: dto.fatherFullName,
                fatherPhone: dto.fatherPhone,
                fatherEmail: dto.fatherEmail?.trim().toLowerCase(),
                fatherNid: dto.fatherNid,
                fatherOccupation: dto.fatherOccupation,
                fatherOrganization: dto.fatherOrganization,
                fatherDesignation: dto.fatherDesignation,
                fatherIncome: dto.fatherIncome,
                fatherAddress: dto.fatherAddress,
                fatherPhotoUrl: dto.fatherPhotoUrl,
                motherFullName: dto.motherFullName,
                motherPhone: dto.motherPhone,
                motherEmail: dto.motherEmail?.trim().toLowerCase(),
                motherNid: dto.motherNid,
                motherOccupation: dto.motherOccupation,
                motherOrganization: dto.motherOrganization,
                motherDesignation: dto.motherDesignation,
                motherIncome: dto.motherIncome,
                motherAddress: dto.motherAddress,
                motherPhotoUrl: dto.motherPhotoUrl,
                targetClassId: dto.targetClassId,
                photoUrl: dto.photoUrl,
                birthCertUrl: dto.birthCertUrl,
                guardianNidUrl: dto.guardianNidUrl,
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
        if (!admission) {
            const err = new Error("Admission not found");
            (err as any).status = 404;
            throw err;
        }
        return admission;
    }

    async update(id: string, dto: UpdateAdmissionDto) {
        await this._exists(id);
        if (dto.guardianEmail !== undefined && !isValidGmailAddress(dto.guardianEmail)) {
            const err = new Error("Guardian email must be a valid Gmail address (example@gmail.com)");
            (err as any).status = 400;
            throw err;
        }
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
                guardianEmail: dto.guardianEmail?.trim().toLowerCase(),
                guardianRelation: dto.guardianRelation,
                targetClassId: dto.targetClassId,
                photoUrl: dto.photoUrl,
                birthCertUrl: dto.birthCertUrl,
                guardianNidUrl: dto.guardianNidUrl,
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

        return admission;
    }

    async convertToStudent(dto: ConvertToStudentDto, schoolId?: string | null) {
        let result;
        for (let attempt = 1; attempt <= 3; attempt += 1) {
            try {
                result = await this.createStudentFromAdmission(dto.admissionId, schoolId);
                break;
            } catch (error: any) {
                const retryableConflict = error?.code === "P2002" || error?.code === "P2034";
                if (!retryableConflict || attempt === 3) throw error;
            }
        }

        if (!result) {
            throw new Error("Unable to convert admission after retrying the database transaction");
        }

        return result;
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

    async getPaidPayments() {
        return prisma.admissionApplication.findMany({
            where: { paymentStatus: "PAID", paymentAmount: { not: null } },
            select: {
                id: true,
                applicantName: true,
                studentId: true,
                paymentAmount: true,
                paymentMethod: true,
                paymentDate: true,
                createdAt: true,
            },
            orderBy: { paymentDate: "desc" },
            take: 100,
        });
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
                studentId: true,
                paymentStatus: true,
                paymentAmount: true,
                paymentMethod: true,
                rejectionReason: true,
                createdAt: true,
                targetClass: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    private async _exists(id: string) {
        const admission = await prisma.admissionApplication.findUnique({ where: { id } });
        if (!admission) {
            const err = new Error("Admission record not found");
            (err as any).status = 404;
            throw err;
        }
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

   
    private async createStudentFromAdmission(admissionId: string, schoolId?: string | null) {
        return prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SET LOCAL statement_timeout = 60000`;
                const admission = await tx.admissionApplication.findUnique({
                    where: { id: admissionId },
                    include: { targetClass: { select: { schoolId: true } } },
                });
                if (!admission) {
                    const err = new Error("Admission record not found");
                    (err as any).status = 404;
                    throw err;
                }
                // Allow retrying an already-converted admission. This is useful
                // when SMTP was unavailable during the first conversion: issue
                // a fresh guardian password and resend the credentials.
                const effectiveSchoolId = schoolId ?? admission.targetClass?.schoolId;
                if (admission.studentId) {
                    const existingParent = await tx.parent.findFirst({
                        where: { user: { email: admission.guardianEmail } },
                        include: { user: { select: { id: true } } },
                    });
                    if (!existingParent) {
                        const parentResult = await this._ensureParentFromAdmission(tx, admission, effectiveSchoolId);
                        if (parentResult) {
                            const student = await tx.student.findUnique({ where: { id: admission.studentId } });
                            if (student && !student.parentId) {
                                await tx.student.update({
                                    where: { id: student.id },
                                    data: { parentId: parentResult.parent.id },
                                });
                            }
                            return {
                                ...admission,
                                name: admission.applicantName,
                                __tempPassword: null,
                                __email: admission.studentEmail,
                                __guardianName: admission.guardianName,
                                __parentTempPassword: parentResult.tempPassword,
                                __parentEmail: parentResult.email,
                            };
                        }
                    }

                    if (existingParent) {
                        const tempPassword = randomBytes(6).toString("hex").toUpperCase();
                        await tx.user.update({
                            where: { id: existingParent.user.id },
                            data: { passwordHash: await bcrypt.hash(tempPassword, 10) },
                        });
                        return {
                            ...admission,
                            name: admission.applicantName,
                            __tempPassword: null,
                            __email: admission.studentEmail,
                            __guardianName: admission.guardianName,
                            __parentTempPassword: tempPassword,
                            __parentEmail: admission.guardianEmail,
                        };
                    }

                    return admission;
                }
                if (admission.status !== "APPROVED") {
                    const err = new Error("Admission must be approved before creating a student account");
                    (err as any).status = 400;
                    throw err;
                }

                if (schoolId && admission.targetClass.schoolId && admission.targetClass.schoolId !== schoolId) {
                    const err = new Error("Admission belongs to another school");
                    (err as any).status = 403;
                    throw err;
                }

                const studentEmail = admission.studentEmail;
                if (!studentEmail) {
                    const err = new Error("Student email is required to create account");
                    (err as any).status = 400;
                    throw err;
                }

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
                            schoolId: effectiveSchoolId ?? undefined,
                        },
                    });
                }

                const sections = await tx.section.findMany({
                    where: { classId: admission.targetClassId },
                    include: { _count: { select: { students: true } } },
                    orderBy: { name: "asc" },
                });
                const section = sections.find((s) => s._count.students < s.maxCapacity);
                if (!section) {
                    const err = new Error("No available section with capacity for this class");
                    (err as any).status = 409;
                    throw err;
                }

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
                            schoolId: effectiveSchoolId ?? undefined,
                        },
                    });
                }

                const parentResult = await this._ensureParentFromAdmission(tx, admission, effectiveSchoolId);
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

                if (admission.paymentStatus === "PAID" && (admission.paymentAmount ?? 0) > 0) {
                    const admissionFeeDate = admission.paymentDate ? new Date(admission.paymentDate) : new Date();
                    const admissionYear = admissionFeeDate.getFullYear();
                    const admissionMonth = admissionFeeDate.getMonth() + 1;
                    const admissionAcademicYear = admissionMonth >= 7 ? `${admissionYear}-${admissionYear + 1}` : `${admissionYear - 1}-${admissionYear}`;
                    const transactionId = admission.transactionId?.trim() || undefined;

                    const existingAdmissionFee = await tx.feeStructure.findFirst({
                        where: {
                            studentId: studentProfile.id,
                            feeType: "ADMISSION",
                            year: admissionYear,
                            month: admissionMonth,
                            academicYear: admissionAcademicYear,
                        },
                    });

                    if (!existingAdmissionFee) {
                        const admissionFee = await tx.feeStructure.create({
                            data: {
                                studentId: studentProfile.id,
                                classId: admission.targetClassId,
                                feeType: "ADMISSION",
                                title: "Admission Fee",
                                amount: admission.paymentAmount!,
                                dueDate: admissionFeeDate,
                                dueDay: admissionFeeDate.getDate(),
                                year: admissionYear,
                                month: admissionMonth,
                                academicYear: admissionAcademicYear,
                                status: "PAID",
                                Paidamount: admission.paymentAmount!,
                            },
                        });

                        const admissionInvoice = await tx.invoice.create({
                            data: {
                                studentId: studentProfile.id,
                                feeStructureId: admissionFee.id,
                                amount: admission.paymentAmount!,
                                dueDate: admissionFeeDate,
                                year: admissionYear,
                                month: admissionMonth,
                                status: "PAID",
                            },
                        });

                        const existingPayment = transactionId
                            ? await tx.payment.findUnique({ where: { transactionId } })
                            : null;

                        if (!existingPayment) {
                            const paymentData = {
                                feeStructureId: admissionFee.id,
                                invoiceId: admissionInvoice.id,
                                studentId: studentProfile.id,
                                amount: admission.paymentAmount!,
                                method: admission.paymentMethod ?? "CASH",
                                status: "PAID" as const,
                                paidAt: admissionFeeDate,
                                ...(transactionId ? { transactionId } : {}),
                            };

                            if (transactionId) {
                                await tx.payment.upsert({
                                    where: { transactionId },
                                    create: paymentData,
                                    update: {},
                                });
                            } else {
                                await tx.payment.create({ data: paymentData });
                            }
                        }
                    }
                }

                return {
                    ...studentProfile,
                    __tempPassword: tempPassword,
                    __email: studentEmail,
                    __guardianName: admission.guardianName,
                    __parentTempPassword: parentResult?.tempPassword ?? null,
                    __parentEmail: parentResult?.email ?? null,
                };
            }, {
                maxWait: 30_000,
                timeout: 60_000,
            }
        ).then(async (result: any) => {
            const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;
            if (result.__tempPassword) {
                await mailService
                    .sendStudentCredentials(result.__email, result.name, result.__tempPassword, loginUrl)
                    .then((mailResult) => {
                        if (!mailResult.success) console.warn("Student welcome email failed:", mailResult.error);
                    });
            }
            if (result.__parentEmail) {
                const parentMailResult = result.__parentTempPassword
                    ? await mailService.sendParentCredentials(
                        result.__parentEmail,
                        result.__guardianName,
                        result.name,
                        result.__parentTempPassword,
                        loginUrl,
                    )
                    : await mailService.sendParentStudentAdded(
                        result.__parentEmail,
                        result.__guardianName,
                        result.name,
                        loginUrl,
                    );
                if (!parentMailResult.success) console.warn("Parent welcome email failed:", parentMailResult.error);
            }
            return result;
        });
    }

    // Creates (or reuses) the guardian's User + Parent account and returns
    // it. Reuses an existing parent account when the guardianEmail already
    // has one (multi-child families). Returns null when no guardianEmail.
    private async _ensureParentFromAdmission(tx: any, admission: any, schoolId?: string | null) {
        const guardianEmail = admission.guardianEmail;
        if (!guardianEmail) return null;

        // Reuse existing parent account (siblings share one guardian email).
        const existingParent = await tx.parent.findFirst({
            where: { user: { email: guardianEmail } },
        });
        if (existingParent) {
            const tempPassword = randomBytes(6).toString("hex").toUpperCase();
            await tx.user.update({
                where: { id: existingParent.userId },
                data: { passwordHash: await bcrypt.hash(tempPassword, 10) },
            });
            return { parent: existingParent, email: guardianEmail, tempPassword };
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
                    schoolId: schoolId ?? undefined,
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

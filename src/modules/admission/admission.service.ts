import prisma from "../../config/db";
import { AdmissionQueryDto, CreateAdmissionDto, UpdateAdmissionDto, UpdateAdmissionStatusDto, ConvertToStudentDto } from "./admission.dto";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

export class AdmissionService {
    async create(dto: CreateAdmissionDto) {
        const classExists = await prisma.class.findUnique({
            where: { id: dto.targetClassId },
        });
        if (!classExists) throw new Error("Class not found");

        const existing = await prisma.admissionApplication.findFirst({
            where: { guardianEmail: dto.guardianEmail },
        });
        if (existing) {
            throw new Error("এই ইমেইল দিয়ে ইতিমধ্যে একটি admission আছে");
        }

        return prisma.admissionApplication.create({
            data: {
                applicantName: dto.applicantName,
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
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 10);
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

        return { data, meta: { page, limit, total } };
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

    async updateStatus(id: string, dto: UpdateAdmissionStatusDto) {
        await this._exists(id);
        const admission = await prisma.admissionApplication.update({
            where: { id },
            data: {
                status: dto.status,
                rejectionReason: dto.rejectionReason,
                reviewedAt: new Date(),
            },
        });

        if (dto.status === "APPROVED" && !admission.studentId) {
            await this.createStudentFromAdmission(admission.id);
        }

        return admission;
    }

    async convertToStudent(_dto: ConvertToStudentDto) {
        throw new Error("Convert to student is not implemented yet");
    }

    async delete(id: string) {
        await this._exists(id);
        return prisma.admissionApplication.delete({ where: { id } });
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

    private async _exists(id: string) {
        const admission = await prisma.admissionApplication.findUnique({ where: { id } });
        if (!admission) throw new Error("Admission record not found");
        return admission;
    }

    private async createStudentFromAdmission(admissionId: string) {
        const admission = await prisma.admissionApplication.findUnique({
            where: { id: admissionId },
        });
        if (!admission) throw new Error("Admission record not found");
        if (admission.studentId) return admission;

        const section = await prisma.section.findFirst({
            where: { classId: admission.targetClassId },
            orderBy: { name: "asc" },
        });
        if (!section) throw new Error("Section not found for class");

        const rollAggregate = await prisma.student.aggregate({
            where: { sectionId: section.id },
            _max: { rollNumber: true },
        });
        const nextRoll = (rollAggregate._max.rollNumber ?? 0) + 1;

        const tempPassword = randomBytes(6).toString("hex");
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        const studentEmail = `${admission.applicantName.replace(/\s+/g, ".").toLowerCase()}-${admission.id.slice(0, 6)}@school.local`;
        const studentId = `STD-${randomBytes(4).toString("hex").toUpperCase()}`;

        const user = await prisma.user.create({
            data: {
                name: admission.applicantName,
                email: studentEmail,
                passwordHash,
                role: "STUDENT",
                studentProfile: {
                    create: {
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
                    },
                },
            },
            select: { id: true, studentProfile: { select: { id: true } } },
        });

        if (user.studentProfile?.id) {
            await prisma.admissionApplication.update({
                where: { id: admission.id },
                data: { studentId: user.studentProfile.id },
            });
        }

        return admission;
    }
}
import prisma from "../../config/db";
import { AdmissionQueryDto, CreateAdmissionDto, UpdateAdmissionDto, UpdateAdmissionStatusDto, ConvertToStudentDto } from "./admission.dto";

export class AdmissionService {
    async create(dto: CreateAdmissionDto) {
        const classExists = await prisma.class.findUnique({
            where: { id: dto.targetClassId },
        });
        if (!classExists) throw new Error("Class not found");

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
        return prisma.admissionApplication.update({
            where: { id },
            data: {
                status: dto.status,
                rejectionReason: dto.rejectionReason,
                reviewedAt: new Date(),
            },
        });
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
}
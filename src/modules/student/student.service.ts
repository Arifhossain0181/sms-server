import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './student.dto';
import prisma from '../../config/db';
import bcrypt from 'bcryptjs';
import { paginate } from '../../utils/pagination.util';
import { mapGender, mapBloodGroup } from './student.maPPer';
import { assertValidRollNumber, assertValidDob } from './student.validation';
import { notFoundError, findAvailableSection, assertRollNumberAvailable } from './student.helPer';
import { linkOrCreateGuardian, updateGuardian } from './student.Parents';
import { getAttendance } from './student.attendence';
import { getResults } from './student.result';

export class StudentService {
    static async getStudentIdByUserId(userId: string) {
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { id: true },
        });
        return student?.id ?? null;
    }

    async createStudent(dto: CreateStudentDto) {
        const rollNumber = assertValidRollNumber(dto.rollNumber);
        const dob = assertValidDob(String(dto.dateOfBirth));

        if (dto.email) {
            const emailExists = await prisma.user.findUnique({ where: { email: dto.email } });
            if (emailExists) throw new Error("Email already exists");
        }

        const classExists = await prisma.class.findUnique({ where: { id: dto.classId } });
        if (!classExists) throw new Error("Class not found");

        return prisma.$transaction(async (tx) => {
            const section = await findAvailableSection(tx, dto.classId);
            await assertRollNumberAvailable(tx, section.id, rollNumber);

            const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : '';
            const studentId = `STU-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

            const user = await tx.user.create({
                data: {
                    name: dto.name,
                    email: dto.email || `student-${Date.now()}@school.local`,
                    passwordHash: hashedPassword,
                    role: 'STUDENT',
                    studentProfile: {
                        create: {
                            studentId,
                            rollNumber,
                            sectionId: section.id,
                            classId: dto.classId,
                            dob,
                            gender: mapGender(dto.gender) as any,
                            bloodGroup: mapBloodGroup(dto.bloodGroup) as any,
                            photo: dto.avatarUrl,
                            address: dto.address,
                            name: dto.name,
                        },
                    },
                },
                select: {
                    id: true, name: true, email: true, role: true, createdAt: true,
                    studentProfile: {
                        select: {
                            id: true, studentId: true, rollNumber: true, classId: true, sectionId: true,
                            dob: true, gender: true, bloodGroup: true, photo: true, address: true, name: true,
                        },
                    },
                },
            });

            const parentId = await linkOrCreateGuardian(tx, dto);
            if (parentId && user.studentProfile?.id) {
                await tx.student.update({ where: { id: user.studentProfile.id }, data: { parentId } });
            }

            return user;
        }, { isolationLevel: 'Serializable' });
    }

    async findAllStudents(query: StudentQueryDto) {
        const { page = '1', limit = '10', search, classId, gender } = query;
        const where: any = {
            ...(classId && { classId }),
            ...(gender && { gender }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    ...(isNaN(Number(search)) ? [] : [{ rollNumber: Number(search) }]),
                ],
            }),
        };
        const { skip, take, meta } = await paginate(prisma.student, where, parseInt(page), parseInt(limit));

        const students = await prisma.student.findMany({
            where,
            skip,
            take,
            include: {
                user: { select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } },
                parent: {
                    select: {
                        phone: true,
                        name: true,
                        user: { select: { email: true } },
                    },
                },
                class: { select: { id: true, name: true } },
                admissionRecord: { select: { guardianPhone: true, guardianEmail: true, guardianName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const flattened = students.map((student) => {
            const guardianEmail = student.parent?.user?.email ?? student.admissionRecord?.guardianEmail ?? null;
            return {
                ...student,
                email: student.user?.email,
                guardianEmail: guardianEmail ?? "—",
                phone: student.parent?.phone ?? student.admissionRecord?.guardianPhone ?? null,
            };
        });

        return { data: flattened, meta };
    }

    /** Staff-only detail view — full history, not publish-gated. Keep behind staff routes. */
    async findStudentById(id: string) {
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } },
                class: { select: { id: true, name: true, sections: true } },
                attendances: { take: 10, orderBy: { date: 'desc' } },
                marks: {
                    include: {
                        exam: { select: { name: true } },
                        subject: { select: { name: true } },
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                feeStructures: { take: 5, orderBy: { dueDate: 'desc' } },
            },
        });
        if (!student) throw notFoundError("Student not found");
        return student;
    }

    async getStudentForEdit(id: string) {
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                class: { select: { id: true, name: true } },
                section: { select: { id: true, name: true } },
                parent: {
                    select: { id: true, name: true, phone: true, relation: true, user: { select: { email: true } } },
                },
            },
        });
        if (!student) throw notFoundError("Student not found");

        return {
            id: student.id,
            studentId: student.studentId,
            rollNumber: student.rollNumber,
            name: student.name,
            email: student.user?.email,
            phone: student.parent?.phone,
            address: student.address,
            dateOfBirth: student.dob ? student.dob.toISOString().split('T')[0] : null,
            gender: student.gender,
            bloodGroup: student.bloodGroup,
            avatarUrl: student.photo,
            religion: student.religion,
            classId: student.classId,
            className: student.class?.name,
            sectionId: student.sectionId,
            sectionName: student.section?.name,
            isActive: student.isActive,
            guardianName: student.parent?.name,
            guardianEmail: student.parent?.user?.email,
            guardianPhone: student.parent?.phone,
            guardianRelation: student.parent?.relation,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
        };
    }

    async findStudentByUserId(userId: string) {
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                user: { select: { id: true, name: true, email: true, isActive: true } },
                class: { select: { id: true, name: true } },
                section: { select: { id: true, name: true } },
                parent: {
                    select: { id: true, name: true, phone: true, relation: true, user: { select: { email: true } } },
                },
                admissionRecord: { select: { status: true } },
            },
        });
        if (!student) throw notFoundError("Student profile not found");
        return student;
    }

    async update(id: string, dto: UpdateStudentDto) {
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
                class: { select: { id: true, name: true } },
                section: { select: { id: true, name: true } },
                parent: { select: { id: true, userId: true, name: true, phone: true } },
            },
        });
        if (!student) throw new Error("Student not found");

        if (dto.classId) {
            const classExists = await prisma.class.findUnique({ where: { id: dto.classId } });
            if (!classExists) throw new Error("Class not found");
        }

        const {
            name, email, dateOfBirth, address, bloodGroup, avatarUrl, classId,
            guardianName, guardianPhone, guardianEmail, guardianRelation,
        } = dto as UpdateStudentDto & { email?: string; dateOfBirth?: string };

        const dob = dateOfBirth ? assertValidDob(dateOfBirth) : undefined;

        if (email && email !== student.user.email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) throw new Error("Email already in use by another user");
        }

        return prisma.$transaction(async (tx) => {
            const userUpdate: Record<string, any> = {};
            if (name !== undefined) userUpdate.name = name;
            if (email !== undefined) userUpdate.email = email;

            const studentUpdateData: Record<string, any> = {};
            if (name !== undefined) studentUpdateData.name = name;
            if (address !== undefined) studentUpdateData.address = address;
            if (avatarUrl !== undefined) studentUpdateData.photo = avatarUrl;
            if (bloodGroup !== undefined) studentUpdateData.bloodGroup = mapBloodGroup(bloodGroup);
            if (dob !== undefined) studentUpdateData.dob = dob;

            if (classId !== undefined && classId !== student.classId) {
                const newSection = await findAvailableSection(tx, classId);
                await assertRollNumberAvailable(tx, newSection.id, student.rollNumber, id);
                studentUpdateData.class = { connect: { id: classId } };
                studentUpdateData.section = { connect: { id: newSection.id } };
            }

            if (Object.keys(userUpdate).length > 0) {
                studentUpdateData.user = { update: userUpdate };
            }

            const newParentId = await updateGuardian(tx, student.parent, {
                guardianName, guardianPhone, guardianEmail, guardianRelation,
            });
            if (newParentId) studentUpdateData.parentId = newParentId;

            return tx.student.update({
                where: { id },
                data: studentUpdateData,
                include: {
                    user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
                    class: { select: { id: true, name: true } },
                    section: { select: { id: true, name: true } },
                    parent: { select: { id: true, name: true, phone: true } },
                },
            });
        }, { isolationLevel: 'Serializable' });
    }

    /** Soft delete — the safe default. */
    async deactivate(id: string) {
        const student = await prisma.student.findUnique({ where: { id } });
        if (!student) throw new Error("Student not found");
        await prisma.$transaction([
            prisma.student.update({ where: { id }, data: { isActive: false } }),
            prisma.user.update({ where: { id: student.userId }, data: { isActive: false } }),
        ]);
    }

    async reactivate(id: string) {
        const student = await prisma.student.findUnique({ where: { id } });
        if (!student) throw new Error("Student not found");
        await prisma.$transaction([
            prisma.student.update({ where: { id }, data: { isActive: true } }),
            prisma.user.update({ where: { id: student.userId }, data: { isActive: true } }),
        ]);
    }

    /**
     * NOTE: named `deleteStudent`, not `delete` — `delete` is a reserved word in
     * JS/TS and `export const delete = ...` is a syntax error. This worked
     * before only because it was a class *method* name (`async delete(id)`),
     * which is allowed; a top-level function export can't use it.
     */
    async deleteStudent(id: string) {
        const student = await prisma.student.findUnique({ where: { id } });
        if (!student) throw new Error("Student not found");

        const [attendanceCount, markCount, paymentCount] = await Promise.all([
            prisma.studentAttendance.count({ where: { studentId: id } }),
            prisma.mark.count({ where: { studentId: id } }),
            prisma.payment.count({ where: { studentId: id } }),
        ]);
        if (attendanceCount > 0 || markCount > 0 || paymentCount > 0) {
            throw {
                status: 409,
                message: 'এই student-এর attendance/marks/payment history আছে — মুছে ফেলা যাবে না, deactivate ব্যবহার করুন',
            };
        }

        await prisma.user.delete({ where: { id: student.userId } });
    }

    /** Controller-facing alias for the hard delete (reserved-word safe). */
    async delete(id: string) {
        return this.deleteStudent(id);
    }

    async uploadAvatar(studentId: string, avatarUrl: string) {
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) throw new Error("Student not found");
        return prisma.student.update({ where: { id: studentId }, data: { photo: avatarUrl } });
    }

    async getAttendance(studentId: string) {
        return getAttendance(studentId);
    }

    async getResults(studentId: string) {
        return getResults(studentId);
    }

    async getClassRoutine(studentId: string) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classId: true, sectionId: true },
        });
        if (!student) throw notFoundError("Student not found");

        return prisma.timetable.findMany({
            where: { sectionId: student.sectionId },
            include: {
                subject: { select: { id: true, name: true } },
                teacher: { select: { id: true, user: { select: { name: true } } } },
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });
    }

    async getStudentDashboard(userId: string) {
        const student = await this.findStudentByUserId(userId);

        const [attendance, results] = await Promise.all([
            getAttendance(student.id),
            getResults(student.id),
        ]);

        return {
            student: {
                id: student.id,
                name: student.user?.name,
                studentId: student.studentId,
                rollNumber: student.rollNumber,
                classId: student.classId,
                className: student.class?.name,
                sectionId: student.sectionId,
                sectionName: student.section?.name,
            },
            attendance,
            results,
        };
    }
}

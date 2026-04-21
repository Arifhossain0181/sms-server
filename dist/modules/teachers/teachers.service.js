"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pagination_util_1 = require("../../utils/pagination.util");
exports.TeachersService = {
    async create(dto) {
        const emailExists = await db_1.default.user.findUnique({ where: { email: dto.email } });
        if (emailExists)
            throw new Error('Email already exists');
        const employeeExists = await db_1.default.teacher.findUnique({ where: { employeeId: dto.TeachersId } });
        if (employeeExists)
            throw new Error('Teacher ID already exists');
        const hashedPassword = await bcryptjs_1.default.hash(dto.password, 10);
        const teacherUser = await db_1.default.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: hashedPassword,
                role: 'TEACHER',
                teacherProfile: {
                    create: {
                        employeeId: dto.TeachersId,
                        name: dto.name,
                        email: dto.email,
                        phone: dto.phone,
                        subjectSpecialization: dto.department ?? dto.designation,
                        joiningDate: new Date(dto.dateOfJoining),
                        photo: dto.avatarUrl,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                teacherProfile: true,
            },
        });
        return teacherUser;
    },
    async findAll(query) {
        const { page = '1', limit = '10', search } = query;
        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { employeeId: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const { skip, take, meta } = await (0, pagination_util_1.paginate)(db_1.default.teacher, where, parseInt(page, 10), parseInt(limit, 10));
        const teachers = await db_1.default.teacher.findMany({
            where,
            skip,
            take,
            include: {
                user: { select: { id: true, name: true, email: true } },
                subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
                sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return { teachers, meta };
    },
    async findById(id) {
        const teacher = await db_1.default.teacher.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
                sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
                timetableSlots: {
                    include: {
                        subject: { select: { id: true, name: true } },
                        section: { select: { id: true, name: true } },
                    },
                    take: 20,
                },
            },
        });
        if (!teacher)
            throw new Error('Teacher not found');
        return teacher;
    },
    async findByUserId(userId) {
        const teacher = await db_1.default.teacher.findUnique({
            where: { userId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
                sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
            },
        });
        if (!teacher)
            throw new Error('Teacher not found');
        return teacher;
    },
    async update(id, dto) {
        const teacher = await db_1.default.teacher.findUnique({ where: { id } });
        if (!teacher)
            throw new Error('Teacher not found');
        const { name, avatarUrl, ...teacherFields } = dto;
        const updatedTeacher = await db_1.default.teacher.update({
            where: { id },
            data: {
                ...teacherFields,
                ...(avatarUrl !== undefined && { photo: avatarUrl }),
                ...(name && {
                    name,
                    user: {
                        update: {
                            name,
                        },
                    },
                }),
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
                sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
            },
        });
        return updatedTeacher;
    },
    async delete(id) {
        const teacher = await db_1.default.teacher.findUnique({ where: { id } });
        if (!teacher)
            throw new Error('Teacher not found');
        await db_1.default.user.delete({ where: { id: teacher.userId } });
    },
    async uploadAvatar(id, avatarUrl) {
        const teacher = await db_1.default.teacher.findUnique({ where: { id } });
        if (!teacher)
            throw new Error('Teacher not found');
        return db_1.default.teacher.update({ where: { id }, data: { photo: avatarUrl } });
    },
    async assignSubjects(id, dto) {
        const teacher = await db_1.default.teacher.findUnique({ where: { id } });
        if (!teacher)
            throw new Error('Teacher not found');
        const validSubjects = await db_1.default.subject.findMany({ where: { id: { in: dto.subjectIds } }, select: { id: true } });
        if (validSubjects.length !== dto.subjectIds.length) {
            throw new Error('One or more subject IDs are invalid');
        }
        await db_1.default.subjectAssignment.deleteMany({ where: { teacherId: id } });
        if (dto.subjectIds.length > 0) {
            await db_1.default.subjectAssignment.createMany({
                data: dto.subjectIds.map((subjectId) => ({ teacherId: id, subjectId })),
            });
        }
        return db_1.default.teacher.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
            },
        });
    },
    async assignClasses(id, dto) {
        const teacher = await db_1.default.teacher.findUnique({ where: { id } });
        if (!teacher)
            throw new Error('Teacher not found');
        const sections = await db_1.default.section.findMany({ where: { classId: { in: dto.classIds } }, select: { id: true } });
        await db_1.default.teacher.update({
            where: { id },
            data: {
                sectionTeacher: {
                    set: sections.map((s) => ({ id: s.id })),
                },
            },
        });
        return db_1.default.teacher.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
            },
        });
    },
    async getTeacherSchedule(id) {
        const teacher = await db_1.default.teacher.findUnique({ where: { id } });
        if (!teacher)
            throw new Error('Teacher not found');
        return db_1.default.timetableSlot.findMany({
            where: { teacherId: id },
            include: {
                subject: { select: { id: true, name: true } },
                section: { select: { id: true, name: true } },
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });
    },
    async getDashboardStats(teacherId) {
        const teacher = await db_1.default.teacher.findUnique({
            where: { id: teacherId },
            include: {
                subjectAssignments: { select: { id: true } },
                sectionTeacher: { select: { classId: true } },
            },
        });
        if (!teacher)
            throw new Error('Teacher not found');
        const classIds = Array.from(new Set(teacher.sectionTeacher.map((s) => s.classId)));
        const [totalStudents, totalClasses, totalSubjects, upcomingExams] = await Promise.all([
            db_1.default.student.count({
                where: {
                    section: {
                        classId: {
                            in: classIds,
                        },
                    },
                },
            }),
            Promise.resolve(classIds.length),
            Promise.resolve(teacher.subjectAssignments.length),
            db_1.default.examSchedule.count({
                where: {
                    classId: {
                        in: classIds,
                    },
                    examDate: {
                        gte: new Date(),
                    },
                },
            }),
        ]);
        return {
            totalStudents,
            totalClasses,
            totalSubjects,
            upcomingExams,
        };
    },
};

import { CreateNoticeDto, NoticeAudience, NoticeQueryDto, UpdateNoticeDto } from './notice.dto';
import prisma from '../../config/db';
import { paginate } from '../../utils/pagination.util';
import { Role } from '@prisma/client';

const ALL_STAFF_ROLES: Role[] = [
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.ACCOUNTANT,
    Role.EXAM_CONTROLLER,
    Role.HR,
    Role.TEACHER,
];

// Maps a notice audience to the User roles that should receive it. Student
// and parent audiences are handled separately via the Student/Parent tables,
// so only the role-based audiences live here.
const audienceToUserRoles: Partial<Record<NoticeAudience, Role[]>> = {
    TEACHERS: [Role.TEACHER],
    STAFF: ALL_STAFF_ROLES,
    SUPER_ADMIN: [Role.SUPER_ADMIN],
    SCHOOL_ADMIN: [Role.SCHOOL_ADMIN],
    ACCOUNTANT: [Role.ACCOUNTANT],
    EXAM_CONTROLLER: [Role.EXAM_CONTROLLER],
    HR: [Role.HR],
};

/**
 * Resolves exactly who a notice should reach: student/parent rows for
 * STUDENTS/PARENTS/ALL (honoring an optional section narrowing), and
 * generic User rows for every staff-type audience via their role.
 */
async function resolveRecipients(audience: NoticeAudience, sectionIds?: string[]) {
    const studentWhere = sectionIds?.length ? { sectionId: { in: sectionIds } } : {};

    let studentIds: string[] = [];
    let parentIds: string[] = [];
    let userIds: string[] = [];

    if (audience === 'STUDENTS' || audience === 'PARENTS' || audience === 'ALL') {
        const students = await prisma.student.findMany({
            where: studentWhere,
            select: { id: true, parentId: true },
        });

        if (audience === 'STUDENTS' || audience === 'ALL') {
            studentIds = students.map((s) => s.id);
        }
        if (audience === 'PARENTS' || audience === 'ALL') {
            parentIds = [...new Set(students.map((s) => s.parentId).filter((id): id is string => !!id))];
        }
    }

    const roleTargets = audience === 'ALL' ? ALL_STAFF_ROLES : audienceToUserRoles[audience];
    if (roleTargets?.length) {
        const users = await prisma.user.findMany({
            where: { role: { in: roleTargets } },
            select: { id: true },
        });
        userIds = users.map((u) => u.id);
    }

    return { studentIds, parentIds, userIds };
}

export const createNotice = async (dto: CreateNoticeDto, authorId: string) => {
    const { studentIds, parentIds, userIds } = await resolveRecipients(dto.audience, dto.sectionIds);

    const notice = await prisma.$transaction(async (tx) => {
        const created = await tx.notice.create({
            data: {
                title: dto.title,
                content: dto.content,
                audience: dto.audience,
                priority: dto.priority || 'NORMAL',
                publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
                authorId,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                attachmentUrl: dto.attachmentUrl,
                isActive: true,
            },
            include: {
                author: { select: { id: true, name: true, email: true, role: true } },
            },
        });

        if (dto.sectionIds?.length) {
            await tx.noticeSectionTarget.createMany({
                data: dto.sectionIds.map((sectionId) => ({ noticeId: created.id, sectionId })),
                skipDuplicates: true,
            });
        }

        if (studentIds.length || parentIds.length || userIds.length) {
            await tx.noticeRecipient.createMany({
                data: [
                    ...studentIds.map((studentId) => ({ noticeId: created.id, studentId })),
                    ...parentIds.map((parentId) => ({ noticeId: created.id, parentId })),
                    ...userIds.map((userId) => ({ noticeId: created.id, userId })),
                ],
                skipDuplicates: true,
            });
        }

        return created;
    });

    return notice;
};

// Admin-facing listing across all notices — unchanged from before, still
// useful for "manage notices" screens regardless of who they targeted.
export const findAll = async (query: NoticeQueryDto) => {
    const { page = '1', limit = '10', search, audience, priority, isActive } = query;
    const where: any = {
        ...(audience && { audience }),
        ...(priority && { priority }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const { skip, take, meta } = await paginate(
        prisma.notice,
        where,
        parseInt(page, 10),
        parseInt(limit, 10)
    );

    const notices = await prisma.notice.findMany({
        where,
        skip,
        take,
        include: {
            author: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
    });

    return { data: notices, meta };
};


 
export const findMyNotices = async (opts: { studentId?: string; parentId?: string; userId?: string }) => {
    if (!opts.studentId && !opts.parentId && !opts.userId) {
        throw new Error('studentId, parentId, or userId is required');
    }

    const now = new Date();

    const recipientRows = await prisma.noticeRecipient.findMany({
        where: {
            ...(opts.studentId && { studentId: opts.studentId }),
            ...(opts.parentId && { parentId: opts.parentId }),
            ...(opts.userId && { userId: opts.userId }),
            notice: {
                isActive: true,
                publishedAt: { lte: now },
                OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
            },
        },
        include: {
            notice: {
                include: {
                    author: { select: { id: true, name: true, email: true, role: true } },
                },
            },
        },
        orderBy: [{ notice: { priority: 'desc' } }, { notice: { publishedAt: 'desc' } }],
    });

    return recipientRows.map((r) => ({
        ...r.notice,
        isRead: r.isRead,
        readAt: r.readAt,
        recipientId: r.id,
    }));
};

// Ownership now checks all three ID columns, since a recipient row can
// belong to a student, a parent, or any staff-type user.
export const markAsRead = async (recipientId: string, ownerId: string) => {
    const recipient = await prisma.noticeRecipient.findUnique({ where: { id: recipientId } });
    if (!recipient) throw new Error('Notice recipient record not found');

    const isOwner = recipient.studentId === ownerId || recipient.parentId === ownerId || recipient.userId === ownerId;
    if (!isOwner) {
        throw { status: 403, message: 'Not your notice' };
    }

    return prisma.noticeRecipient.update({
        where: { id: recipientId },
        data: { isRead: true, readAt: new Date() },
    });
};

export const findById = async (id: string) => {
    const notice = await prisma.notice.findUnique({
        where: { id },
        include: {
            author: { select: { id: true, name: true, email: true, role: true } },
        },
    });

    if (!notice) {
        throw new Error('Notice not found');
    }

    return notice;
};

export const update = async (dto: UpdateNoticeDto, id: string) => {
    await findById(id);
    return prisma.notice.update({
        where: { id },
        data: {
            ...dto,
            ...(dto.publishedAt && { publishedAt: new Date(dto.publishedAt) }),
            ...(dto.expiresAt && { expiresAt: new Date(dto.expiresAt) }),
        },
        include: {
            author: { select: { id: true, name: true, email: true, role: true } },
        },
    });
};

export const deleteNotice = async (id: string) => {
    await findById(id);
    return prisma.notice.delete({ where: { id } });
};

export const toggleActive = async (id: string) => {
    const notice = await findById(id);
    return prisma.notice.update({
        where: { id },
        data: { isActive: !notice.isActive },
    });
};

/**
 * Fetch notices for an authenticated user based on their role and userId.
 * Maps the user to their appropriate recipient ID (studentId, parentId, or userId).
 */
export const getFeedForUser = async (opts: { role: string; userId: string }) => {
    const { role, userId } = opts;

    // For staff roles, use the userId directly
    if (ALL_STAFF_ROLES.includes(role as Role)) {
        return findMyNotices({ userId });
    }

    // For students, look up their Student record
    if (role === Role.STUDENT || role === 'STUDENT') {
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (student) {
            return findMyNotices({ studentId: student.id });
        }
    }

    // For parents, look up their Parent record
    if (role === Role.PARENT || role === 'PARENT') {
        const parent = await prisma.parent.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (parent) {
            return findMyNotices({ parentId: parent.id });
        }
    }

    // Fallback: return empty array if no matching recipient ID
    return [];
};
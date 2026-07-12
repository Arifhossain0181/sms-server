import { CreateNoticeDto, NoticeAudience, NoticeQueryDto, UpdateNoticeDto } from './notice.dto';
import prisma from '../../config/db';
import { paginate } from '../../utils/pagination.util';


async function resolveRecipients(audience: NoticeAudience, sectionIds?: string[]) {
    const studentWhere = sectionIds?.length ? { sectionId: { in: sectionIds } } : {};

    const needsStudents = audience === 'STUDENT' || audience === 'ALL';
    const needsParents = audience === 'PARENT' || audience === 'ALL';

    if (!needsStudents && !needsParents) {
        return { studentIds: [] as string[], parentIds: [] as string[] };
    }

    const students = await prisma.student.findMany({
        where: studentWhere,
        select: { id: true, parentId: true },
    });

    const studentIds = needsStudents ? students.map((s) => s.id) : [];
    const parentIds = needsParents
        ? [...new Set(students.map((s) => s.parentId).filter((id): id is string => !!id))]
        : [];

    return { studentIds, parentIds };
}

export const createNotice = async (dto: CreateNoticeDto, authorId: string) => {
    const { studentIds, parentIds } = await resolveRecipients(dto.audience, dto.sectionIds);

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
                author: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });

        if (dto.sectionIds?.length) {
            await tx.noticeSectionTarget.createMany({
                data: dto.sectionIds.map((sectionId) => ({ noticeId: created.id, sectionId })),
                skipDuplicates: true,
            });
        }

        if (studentIds.length || parentIds.length) {
            await tx.noticeRecipient.createMany({
                data: [
                    ...studentIds.map((studentId) => ({ noticeId: created.id, studentId })),
                    ...parentIds.map((parentId) => ({ noticeId: created.id, parentId })),
                ],
            });
        }

        return created;
    });

    return notice;
};

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
            author: {
                select: { id: true, name: true, email: true, role: true },
            },
        },
        orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
    });

    return { data: notices, meta };
};

/**
 * Dashboard feed for a single logged-in student or parent.
 *
 * FIX: this used to run a generic audience/role query with a section
 * filter that was commented out but never implemented — a STUDENTS
 * notice targeted at Section 5A was showing up for every student in
 * every section. It now reads directly off NoticeRecipient, which is
 * exactly the set of people the notice was actually created for
 * (see resolveRecipients above), and surfaces isRead/readAt so the
 * dashboard can show an unread badge.
 */
export const findMyNotices = async (opts: { studentId?: string; parentId?: string }) => {
    if (!opts.studentId && !opts.parentId) {
        throw new Error('studentId or parentId is required');
    }

    const now = new Date();

    const recipientRows = await prisma.noticeRecipient.findMany({
        where: {
            ...(opts.studentId && { studentId: opts.studentId }),
            ...(opts.parentId && { parentId: opts.parentId }),
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

/**
 * Role/audience match feed for TEACHER and the staff roles (ACCOUNTANT,
 * EXAM_CONTROLLER, HR, LIBRARIAN, RECEPTIONIST). These have no
 * NoticeRecipient rows (schema has no staffId/teacherId column), so they
 * read by audience == their own role (or ALL) instead of a personal row.
 */
export const findPublic = (role: NoticeAudience) => {
    const now = new Date();

    return prisma.notice.findMany({
        where: {
            isActive: true,
            publishedAt: { lte: now },
            OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
            audience: { in: ['ALL', role] },
        },
        include: {
            author: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
    });
};

/**
 * Single entry point for any logged-in user's dashboard feed.
 * Routes to the correct source based on the caller's role:
 *   - STUDENT / PARENT  → per-person NoticeRecipient rows (respects section
 *     targeting and exposes isRead/readAt for the unread badge)
 *   - SUPER_ADMIN / SCHOOL_ADMIN → every active notice (admins see all)
 *   - every other role  → notices where audience is ALL or that role
 */
export const getFeedForUser = async (opts: { role: string; userId: string }) => {
    const { role, userId } = opts;

    if (role === 'STUDENT') {
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { id: true },
        });
        return student ? findMyNotices({ studentId: student.id }) : [];
    }

    if (role === 'PARENT') {
        const parent = await prisma.parent.findUnique({
            where: { userId },
            select: { id: true },
        });
        return parent ? findMyNotices({ parentId: parent.id }) : [];
    }

    if (role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') {
        const now = new Date();
        return prisma.notice.findMany({
            where: {
                isActive: true,
                publishedAt: { lte: now },
                OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
            },
            include: { author: { select: { id: true, name: true, email: true, role: true } } },
            orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
        });
    }

    return findPublic(role as NoticeAudience);
};

// NEW: wires up the isRead/readAt columns that already existed on
// NoticeRecipient but nothing ever set.
export const markAsRead = async (recipientId: string, ownerId: string) => {
    const recipient = await prisma.noticeRecipient.findUnique({ where: { id: recipientId } });
    if (!recipient) throw new Error('Notice recipient record not found');
    if (recipient.studentId !== ownerId && recipient.parentId !== ownerId) {
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
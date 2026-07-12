import prisma from "../../config/db"
import { paginate } from "../../utils/pagination.util"
import { BroadcastNotificationDto, NotificationQueryDto, SendNotificationDto } from "./notification.dto"
import { emitToRole, emitToUser } from "../../config/socket"

export const send = async (dto: SendNotificationDto) => {
    const notification = await prisma.notification.create({
        data: {
            userId: dto.userId,
            title: dto.title,
            body: dto.body,
            type: dto.type,
            referenceId: dto.referenceId,
            isRead: false
        }
    })

    // the DB write already succeeded above — a push failure here
    // (socket layer down, user not connected, etc.) shouldn't make the
    // caller think send() failed and retry, creating a duplicate row.
    try {
        emitToUser(dto.userId, "notification:new", {
            id: notification.id,
            title: notification.title,
            body: notification.body,
            type: notification.type,
            referenceId: notification.referenceId,
            createdAt: notification.createdAt,
            isRead: notification.isRead
        })
    } catch (err) {
        console.error('Failed to emit notification:new:', err)
    }

    return notification
}

export const broadcast = async (dto: BroadcastNotificationDto) => {
    // the ALL branch was missing `select`, so it pulled every column
    // (including password hash) for every user in the school just to
    // read `.id`. Both branches now fetch only what's used.
    const users = dto.role === "ALL"
        ? await prisma.user.findMany({ select: { id: true } })
        : await prisma.user.findMany({ where: { role: dto.role }, select: { id: true } })

    if (!users.length) throw new Error("No users found for the specified role")

    // create notification for each user
    await prisma.notification.createMany({
        data: users.map(user => ({
            userId: user.id,
            title: dto.title,
            body: dto.body,
            type: dto.type,
            referenceId: dto.referenceId,
            isRead: false
        }))
    })

    // Single socket broadcast to the role room (no per-user loop needed).
    // the DB write already succeeded above — a push failure here
    // (socket layer down, user not connected, etc.) shouldn't make the
    // caller think broadcast() failed and retry, creating a duplicate row.
    try {
        emitToRole(dto.role, 'notification:new', {
            title: dto.title,
            body: dto.body,
            type: dto.type,
            referenceId: dto.referenceId,
            isRead: false,
            createdAt: new Date(),
        });
    } catch (err) {
        console.error('Failed to emit role broadcast:', err)
    }

    return {
        sent: users.length
    }
}

export const findAll = async (userId: string, query: NotificationQueryDto) => {
    const { page = '1', limit = '20', isRead, type } = query;

    const where: any = {
        userId,
        ...(type && { type }),
        ...(isRead !== undefined && { isRead: isRead === 'true' }),
    };

    const { skip, take, meta } = await paginate(
        prisma.notification, where, parseInt(page, 10), parseInt(limit, 10)
    );

    const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, unreadCount, meta };
};

export const markRead = async (userId: string, notificationId: string) => {
    // the DB write already succeeded above — a push failure here
    // (socket layer down, user not connected, etc.) shouldn't make the
    // caller think markRead() failed and retry, creating a duplicate row.
    const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId }
    })
    if (!notification) throw new Error("Notification not found")
    if (notification.isRead) return notification // already read

    const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() }
    })

    try {
        emitToUser(userId, 'notification:read', { id: notificationId })
    } catch (err) {
        console.error('Failed to emit notification:read:', err)
    }

    return updated
};

export const markAllRead = async (userId: string) => {
    const { count } = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() }
    })

    try {
        emitToUser(userId, 'notification:readAll', {})
    } catch (err) {
        console.error('Failed to emit notification:readAll:', err)
    }

    return { marked: count }
};

export const deleteNotification = async (id: string, userId: string) => {
    const notification = await prisma.notification.findUnique({
        where: { id }
    })
    if (!notification || notification.userId !== userId) throw new Error("Notification not found or not authorized")
    return await prisma.notification.delete({
        where: { id }
    })
};

export const deleteAll = async (userId: string) => {
    const { count } = await prisma.notification.deleteMany({
        where: { userId }
    })
    return { deleted: count }
};

export const getUnreadCount = async (userId: string) => {
    const count = await prisma.notification.count({
        where: { userId, isRead: false }
    })
    return { unreadCount: count }
};
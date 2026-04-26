import { read } from "node:fs"
import prisma from "../../config/db"
import { paginate } from "../../utils/pagination.util"
import { BroadcastNotificationDto, NotificationQueryDto, SendNotificationDto } from "./notification.dto"
import { emit } from "node:cluster"


export const send =async(dto:SendNotificationDto)=>{
    const notification =await prisma.notification.create({
        data:{
            userId: dto.userId,
            title: dto.title,
            body: dto.body,
            type: dto.type,
            referenceId: dto.referenceId,
            isRead: false
        }
    })
    // real time Push to the users Personal room 
    emitToUser(dto.userId,"notification :new " ,{
        id: notification.id,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        referenceId: notification.referenceId,
        createdAt: notification.createdAt
        ,isRead: notification.isRead
    })
    return notification
}


export const broadcast = async (dto:BroadcastNotificationDto) =>{
    // find all users with the role
    const users = dto.role === "ALL" ? await prisma.user.findMany() : await prisma.user.findMany({
        where:{
            role: dto.role        } ,
            select:{
                id: true
            }
    })
    if( !users.length) throw new Error("No users found for the specified role")

    // create notification for each user 
    await prisma.notification.createMany({
        data: users.map( user => ({
            userId: user.id,
            title: dto.title,
            body: dto.body,
            type: dto.type,
            referenceId: dto.referenceId,
            isRead: false
        }))
    })
     // Single socket broadcast to the role room (no per-user loop needed)
    emitToRole(dto.role, 'notification:new', {
      title:       dto.title,
      body:        dto.body,
      type:        dto.type,
      referenceId: dto.referenceId,
      isRead:      false,
      createdAt:   new Date(),
    });
    return {
        sent: users.length
    }

}

export const    findAll = async(userId: string, query: NotificationQueryDto) {
    const { page = '1', limit = '20', isRead, type } = query;
 
    const where: any = {
      userId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead: isRead === 'true' }),
    };
 
    const { skip, take, meta } = await paginate(
      prisma.notification, where, parseInt(page), parseInt(limit)
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
 
    return { notifications, unreadCount, meta };}
  
    export const markRead = async (userId: string, notificationId: string) => {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId, userId }
        
        })
        if (!notification) throw new Error("Notification not found")
        if (notification.isRead) return notification // already read
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true ,readAt: new Date() }
        })
        emitToUser(userId, 'notification:read', { id: notificationId })
        return notification
    }

    export const markAllRead = async (userId: string) => {
        const {count} = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true ,readAt: new Date() }
        })
        emitToUser(userId, 'notification:readAll', {})
        return { marked: count }
    }

    export const delete = async (id: string, userId: string) => {
        const notification = await prisma.notification.deleteMany({
            where: { id, userId }
        })
        if(!notification) throw new Error("Notification not found or not authorized")  
            await prisma.notification.delete({
                where: { id }
            })
        return notification
    }
    export const deleteAll = async (userId: string) => {
        const { count } = await prisma.notification.deleteMany({
            where: { userId }
        })
        return { deleted: count }
    }

    export const getUnreadCount = async (userId: string) => {   
        const count = await prisma.notification.count({
            where: { userId, isRead: false }
        })
        return { unreadCount: count }
    }
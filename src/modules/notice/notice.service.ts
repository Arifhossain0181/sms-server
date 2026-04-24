import { title } from "node:process";
import { CreateNoticeDto } from "./notice.dto";
import prisma from "../../config/db";

export const createNotice =async(dto:CreateNoticeDto ,authorId:string) => {
    return prisma.notice.create({
        data:{
            title: dto.title,
            content:dto.content,
            audience:dto.audience,
            priority:dto.priority || 'NORMAL',
            publishedAt:dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
            authorId: authorId ,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
            attachmentUrl: dto.attachmentUrl ,
            isActive   : true

        },
        include:{
            author:{
                selecet:{
                    id:true,
                    name:true,
                    email:true,
                    role:true
                }
            }
        }
    })
}

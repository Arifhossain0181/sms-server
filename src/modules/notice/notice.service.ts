import { title } from "node:process";
import { CreateNoticeDto, NoticeAudience, NoticeQueryDto, UpdateNoticeDto } from "./notice.dto";
import prisma from "../../config/db";
import { _exists } from "../fee/fee.service";

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
export const findAll = async(query:NoticeQueryDto) =>{
    const { page = '1', limit = '10', search, audience, priority, isActive } = query;
const where:any ={
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
const {skip, take ,meta} = getPagination(
     prisma.notice,
      where,
      parseInt(page),
      parseInt(limit)
);
const notices = await prisma.notice.findMany({
    where,
    skip,
    take,
    orderBy: { publishedAt: 'desc' },
    include:{
        author:{
            select:{
                id:true,
                name:true,
                email:true,
                role:true
            }
        }

    },
    orderBy:[{
        publishedAt:'desc'
    },
    {
        priority: 'desc' 
    }
])
   return {
    data:notices,
    meta
   }
}
export const findPublic(role:NoticeAudience)=>{
    const now = new Date();
    return prisma.notice.findMany({
        where:{
            isActive:true,
            publishedAt:{ lte: now },
            expiresAt:{ gte: now },
            OR:[
                {
                     expiresAt: null }, { expiresAt: { gte: now }
                }
            ],
            audience: {in:['All', role]}
        },
        include:{
            {
                author:{
                    selecet:{
                        id:true,
                        name:true,
                        email:true,
                        role:true
                    }
                }
            },
            orderBy:[{ priority: 'desc' }, { publishedAt: 'desc' }]
        }
    })
export const findById = async(id:string) =>{
    const notice = await prisma.notice.findUnique({
        where:{ id },
        include:{
            author:{
                select:{
                    id:true,
                    name:true,
                    email:true,
                    role:true
                }
            }
        },
        if(!notice){
            throw new Error('Notice not found')
        }

    })
    return notice;
}
export const update(dto:UpdateNoticeDto , id:string) =>{
    await findById(id);
    return prisma.notice.update({
        where:{ id },
        data:{
            ...dto,
            ...(dto.publishedAt && { publishedAt: new Date(dto.publishedAt) }),
            ...(dto.expiresAt && { expiresAt: new Date(dto.expiresAt) }),
        },
        include:{
            author:{
                select:{
                    id:true,
                    name:true,
            }
        }
}})

export const delete(id:string) =>{
    await findById(id);
    return prisma.notice.delete({
        where:{ id }
    })
}

export const toggleActive = async(id:string) =>{
    const notice = await findById(id);
    return prisma.notice.update({
        where:{ id },
        data:{
            isActive: !notice.isActive
        }
    })
}

  private async _exists(id: string) {
    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new Error('Notice not found');
    return notice;
  }
}


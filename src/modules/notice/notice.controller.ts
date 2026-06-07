import { Request, Response, NextFunction } from 'express';
import {
  createNotice,
  findAll,
  findPublic,
  findById,
  update as updateNotice,
  deleteNotice,
  toggleActive,
} from './notice.service';
import { sendSuccess } from '../../utils/response.util';
import prisma from '../../config/db';

// Map DB role → NoticeAudience
const roleToAudience: Record<string, any> = {
  STUDENT: 'STUDENTS',
  TEACHER: 'TEACHERS',
  PARENT: 'PARENTS',
  ADMIN: 'ALL',
};

export class NoticeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const notice = await createNotice(req.body, req.user!.id);
      sendSuccess(res, notice, 'Notice created', 201);
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await findAll(req.query as any);
      sendSuccess(res, data, 'Notices fetched');
    } catch (err) { next(err); }
  }

  /** Authenticated user sees only notices relevant to their role */
  async findPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = req.user!.role;
      const audience = roleToAudience[userRole] ?? 'ALL';
      console.log(`\n[NOTICE] User role: ${userRole}, Audience filter: ${audience}`);
      
      let sectionId: string | undefined;
      
      // If student, fetch their section
      if (userRole === 'STUDENT') {
        const student = await prisma.student.findUnique({
          where: { userId: req.user!.id },
          select: { sectionId: true },
        });
        sectionId = student?.sectionId;
        console.log(`[NOTICE] Student section ID: ${sectionId}`);
      }
      
      const notices = await findPublic(audience, sectionId);
      console.log(`[NOTICE] ✅ Found ${notices.length} notices for ${userRole}`);
      sendSuccess(res, notices, 'Notices fetched');
    } catch (err) { 
      console.error(`[NOTICE] ❌ Error:`, (err as any)?.message);
      next(err); 
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      const notice = await findById(idStr);
      sendSuccess(res, notice, 'Notice fetched');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      const notice = await updateNotice(req.body, idStr);
      sendSuccess(res, notice, 'Notice updated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      await deleteNotice(idStr);
      sendSuccess(res, null, 'Notice deleted');
    } catch (err) { next(err); }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      const notice = await toggleActive(idStr);
      sendSuccess(res, notice, `Notice ${notice.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { next(err); }
  }
}
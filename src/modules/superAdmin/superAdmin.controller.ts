import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { sendSuccess } from '../../utils/response.util';

export class SuperAdminController {
  async getSchools(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a multi-tenant system, this would fetch from a School model.
      // Since this is currently a single-school system, we'll mock the school
      // and aggregate stats from the actual database.
      
      const totalStudents = await prisma.student.count();
      const totalTeachers = await prisma.teacher.count();

      const schoolData = [
        {
          id: 1,
          name: "Greenwood High",
          students: totalStudents,
          teachers: totalTeachers,
          status: "Active",
        }
      ];

      sendSuccess(res, schoolData, 'Schools data fetched successfully');
    } catch (err) {
      next(err);
    }
  }
}

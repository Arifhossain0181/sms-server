import { Request, Response, NextFunction } from 'express';

import { sendSuccess } from '../../utils/response.util';
import cloudinary from '../../config/cloudinary';
import { TeachersService } from './teachers.service';

const teacherService = TeachersService;

const ADMIN_LIKE_ROLES = ['ADMIN', 'SCHOOL_ADMIN', 'HR'];
const SENSITIVE_FIELDS = ['salary', 'address', 'bloodGroup', 'dateOfBirth'] as const;

function redactForRole<T extends Record<string, any>>(teacher: T, role?: string): T {
  if (role && ADMIN_LIKE_ROLES.includes(role)) return teacher;
  const copy = { ...teacher };
  for (const field of SENSITIVE_FIELDS) delete copy[field];
  return copy;
}

export class TeacherController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await teacherService.create(req.body);
      sendSuccess(res, teacher, 'Teacher created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await teacherService.findAll(req.query as any);
      sendSuccess(res, {
        ...data,
        teachers: data.teachers.map((t: any) => redactForRole(t, req.user?.role)),
      }, 'Teachers fetched');
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await teacherService.findById(String(req.params.id));
      sendSuccess(res, redactForRole(teacher, req.user?.role), 'Teacher fetched');
    } catch (err) {
      next(err);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // Own profile — never redacted, this is the teacher's own data.
      const teacher = await teacherService.findByUserId(req.user!.id);
      sendSuccess(res, teacher, 'Teacher profile fetched');
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await teacherService.update(String(req.params.id), req.body);
      sendSuccess(res, teacher, 'Teacher updated');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await teacherService.delete(String(req.params.id));
      sendSuccess(res, null, 'Teacher deleted');
    } catch (err) {
      next(err);
    }
  }

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw { status: 400, message: 'No file uploaded' };

      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'teachers/avatars' }, (error, uploadResult) => {
          if (error || !uploadResult) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve({ secure_url: uploadResult.secure_url });
        });
        stream.end(req.file!.buffer);
      });

      const teacher = await teacherService.uploadAvatar(String(req.params.id), result.secure_url);
      sendSuccess(res, teacher, 'Avatar uploaded');
    } catch (err) {
      next(err);
    }
  }

  async assignSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await teacherService.assignSubjects(String(req.params.id), req.body);
      sendSuccess(res, teacher, 'Subjects assigned');
    } catch (err) {
      next(err);
    }
  }

  async assignClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await teacherService.assignClasses(String(req.params.id), req.body);
      sendSuccess(res, teacher, 'Classes assigned');
    } catch (err) {
      next(err);
    }
  }

  async getSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String(req.params.id);

      // :id may be this teacher's own userId (e.g. a teacher hitting
      // their own schedule with their JWT id) or an actual teacherId —
      // resolve userId → teacherId when possible, otherwise assume :id
      // is already a teacherId.
      const teacherByUserId = await teacherService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      try {
        const data = await teacherService.getTeacherSchedule(teacherId);
        sendSuccess(res, data, 'Schedule fetched');
      } catch (scheduleErr: any) {
        //  previously ANY error here (DB error, bug, etc.) was
        // treated as "teacher not found" and silently answered with an
        // empty array + 200 OK. Only the actual not-found case should
        // do that; everything else needs to surface as a real error.
        if (scheduleErr?.status === 404) {
          sendSuccess(res, [], 'Schedule fetched');
        } else {
          next(scheduleErr);
        }
      }
    } catch (err) {
      next(err);
    }
  }

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String(req.params.id);

      const teacherByUserId = await teacherService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      try {
        const data = await teacherService.getDashboardStats(teacherId);
        sendSuccess(res, data, 'Dashboard stats fetched');
      } catch (statsErr: any) {
        // Same fix as getSchedule — only fall back to zeros on a real
        // not-found, not on every possible error.
        if (statsErr?.status === 404) {
          sendSuccess(res, {
            totalStudents: 0,
            totalClasses: 0,
            totalSubjects: 0,
            upcomingExams: 0,
          }, 'Dashboard stats fetched');
        } else {
          next(statsErr);
        }
      }
    } catch (err) {
      next(err);
    }
  }
}
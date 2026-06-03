import { Request, Response, NextFunction } from 'express';

import { sendSuccess } from '../../utils/response.util';
import cloudinary from '../../config/cloudinary';
import { TeachersService } from './teachers.service';
 
const teacherService = TeachersService;
 
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
      sendSuccess(res, data, 'Teachers fetched');
    } catch (err) {
      next(err);
    }
  }
 
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await teacherService.findById(String(req.params.id));
      sendSuccess(res, teacher, 'Teacher fetched');
    } catch (err) {
      next(err);
    }
  }
 
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
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
      if (!req.file) throw new Error('No file uploaded');

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
      console.log('getSchedule: Starting with ID:', teacherId);
      
      // First, check if the ID is a user ID and try to find the teacher
      try {
        const teacherByUserId = await teacherService.getTeacherIdByUserId(teacherId);
        console.log('getSchedule: Teacher lookup result:', teacherByUserId);
        if (teacherByUserId) {
          teacherId = teacherByUserId;
        }
      } catch (err) {
        // If lookup fails, assume it's already a teacher ID
        console.error('getSchedule: Teacher ID lookup failed:', err);
      }
      
      console.log('getSchedule: Using teacher ID:', teacherId);
      try {
        const data = await teacherService.getTeacherSchedule(teacherId);
        sendSuccess(res, data, 'Schedule fetched');
      } catch (scheduleErr) {
        console.warn('getSchedule: Teacher not found, returning empty array');
        sendSuccess(res, [], 'Schedule fetched');
      }
    } catch (err) {
      console.error('getSchedule: Error:', err);
      next(err);
    }
  }
 
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String(req.params.id);
      console.log('getDashboardStats: Starting with ID:', teacherId);
      
      // First, check if the ID is a user ID and try to find the teacher
      try {
        const teacherByUserId = await teacherService.getTeacherIdByUserId(teacherId);
        console.log('getDashboardStats: Teacher lookup result:', teacherByUserId);
        if (teacherByUserId) {
          teacherId = teacherByUserId;
        }
      } catch (err) {
        // If lookup fails, assume it's already a teacher ID
        console.error('getDashboardStats: Teacher ID lookup failed:', err);
      }
      
      console.log('getDashboardStats: Using teacher ID:', teacherId);
      try {
        const data = await teacherService.getDashboardStats(teacherId);
        sendSuccess(res, data, 'Dashboard stats fetched');
      } catch (statsErr) {
        console.warn('getDashboardStats: Teacher not found, returning zero stats');
        sendSuccess(res, {
          totalStudents: 0,
          totalClasses: 0,
          totalSubjects: 0,
          upcomingExams: 0,
        }, 'Dashboard stats fetched');
      }
    } catch (err) {
      console.error('getDashboardStats: Error:', err);
      next(err);
    }
  }
}
 
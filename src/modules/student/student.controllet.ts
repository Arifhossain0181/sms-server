import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import { sendSuccess } from '../../utils/response.util';
import cloudinary from '../../config/cloudinary';
 
const studentService = new StudentService();
 
export class StudentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.createStudent(req.body);
      sendSuccess(res, student, 'Student created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
 
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.findAllStudents(req.query as any);
      sendSuccess(res, data, 'Students fetched');
    } catch (err) {
      next(err);
    }
  }
 
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.findStudentById(String(req.params.id));
      sendSuccess(res, student, 'Student fetched');
    } catch (err) {
      next(err);
    }
  }
 
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.findStudentByUserId(req.user!.id);
      sendSuccess(res, student, 'Student profile fetched');
    } catch (err) {
      next(err);
    }
  }
 
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.update(String(req.params.id), req.body);
      sendSuccess(res, student, 'Student updated');
    } catch (err) {
      next(err);
    }
  }
 
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await studentService.delete(String(req.params.id));
      sendSuccess(res, null, 'Student deleted');
    } catch (err) {
      next(err);
    }
  }
 
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new Error('No file uploaded');

      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'students/avatars' }, (error, uploadResult) => {
          if (error || !uploadResult) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve({ secure_url: uploadResult.secure_url });
        });
        stream.end(req.file!.buffer);
      });

      const student = await studentService.uploadAvatar(String(req.params.id), result.secure_url);
      sendSuccess(res, student, 'Avatar uploaded');
    } catch (err) {
      next(err);
    }
  }
 
  async getAttendanceSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getAttendance(String(req.params.id));
      sendSuccess(res, data, 'Attendance summary fetched');
    } catch (err) {
      next(err);
    }
  }
 
  async getResultSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getResults(String(req.params.id));
      sendSuccess(res, data, 'Result summary fetched');
    } catch (err) {
      next(err);
    }
  }
}
 
import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import { sendSuccess } from '../../utils/response.util';
import cloudinary from '../../config/cloudinary';
 
const studentService = new StudentService();
 
export class StudentController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.createStudent(req.body);
      sendSuccess(res, student, 'Student created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
 
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await studentService.findAllStudents(req.query as any);
      sendSuccess(res, data, 'Students fetched');
    } catch (err) {
      next(err);
    }
  }
 
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.findStudentById(String(req.params.id));
      sendSuccess(res, student, 'Student fetched');
    } catch (err) {
      next(err);
    }
  }

  async getStudentForEdit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.getStudentForEdit(String(req.params.id));
      sendSuccess(res, student, 'Student data fetched for edit');
    } catch (err) {
      next(err);
    }
  }
 
  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(`\n[STUDENT] getMyProfile called - User ID: ${req.user?.id}`);
      const student = await studentService.findStudentByUserId(req.user!.id);
      
      // Check if admission is approved
      const admissionStatus = student.admissionRecord?.status;
      if (admissionStatus && admissionStatus !== "APPROVED") {
        console.log(`[STUDENT] ⚠️ Admission not approved - Status: ${admissionStatus}`);
        sendSuccess(res, { 
          id: student.id, 
          pending: true,
          admissionStatus,
          message: `Your admission is ${admissionStatus.toLowerCase()}. Waiting for admin approval.`
        }, 'Student profile pending approval');
        return;
      }
      
      console.log(`[STUDENT] ✅ Profile found and returned - Admission: APPROVED`);
      sendSuccess(res, student, 'Student profile fetched');
    } catch (err) {
      console.log(`[STUDENT] Error fetching profile:`, (err as any)?.message);
      // যদি student profile না থাকে তাহলে basic user info return করুন
      if ((err as any)?.message?.includes('not found')) {
        console.log(`[STUDENT] ⚠️ Student profile not found for user: ${req.user!.id}, but user exists`);
        // Return user ID so frontend knows who they are
        sendSuccess(res, { 
          id: req.user!.id, 
          pending: true,
          message: 'Student profile is pending. Please complete your admission application.'
        }, 'Student profile pending approval');
        return;
      }
      next(err);
    }
  }
 
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.update(String(req.params.id), req.body);
      sendSuccess(res, student, 'Student updated');
    } catch (err) {
      next(err);
    }
  }
 
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await studentService.delete(String(req.params.id));
      sendSuccess(res, null, 'Student deleted');
    } catch (err) {
      next(err);
    }
  }
 
  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
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
 
  async getAttendanceSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await studentService.getAttendance(String(req.params.id));
      sendSuccess(res, data, 'Attendance summary fetched');
    } catch (err) {
      next(err);
    }
  }
 
  async getResultSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await studentService.getResults(String(req.params.id));
      sendSuccess(res, data, 'Result summary fetched');
    } catch (err) {
      next(err);
    }
  }

  async getClassRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get student ID from user ID
      const student = await (studentService as any).findStudentByUserId(req.user!.id);
      const data = await studentService.getClassRoutine(student.id);
      sendSuccess(res, data, 'Class routine fetched');
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await studentService.getStudentDashboard(req.user!.id);
      sendSuccess(res, data, 'Student dashboard data fetched');
    } catch (err) {
      next(err);
    }
  }
}
 
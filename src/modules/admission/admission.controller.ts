import { Request, Response, NextFunction } from 'express';
import { AdmissionService } from './admission.service';
import { sendSuccess } from '../../utils/response.util';
import { uploadToCloudinary } from '../../config/cloudinary';

const admissionService = new AdmissionService();

export class AdmissionController {
  /** Public — no auth required */
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await admissionService.create(req.body);
      sendSuccess(res, admission, 'Application submitted successfully', 201);
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await admissionService.findAll(req.query as any);
      sendSuccess(res, data, 'Admissions fetched');
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await admissionService.findById(req.params.id);
      sendSuccess(res, admission, 'Admission fetched');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await admissionService.update(req.params.id, req.body);
      sendSuccess(res, admission, 'Admission updated');
    } catch (err) { next(err); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await admissionService.updateStatus(
        req.params.id,
        req.body,
        req.user!.id
      );
      sendSuccess(res, admission, 'Admission status updated');
    } catch (err) { next(err); }
  }

  async convertToStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await admissionService.convertToStudent(req.body);
      sendSuccess(res, student, 'Student account created from admission', 201);
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await admissionService.delete(req.params.id);
      sendSuccess(res, null, 'Admission deleted');
    } catch (err) { next(err); }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await admissionService.getStats();
      sendSuccess(res, stats, 'Stats fetched');
    } catch (err) { next(err); }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new Error('No file uploaded');
      const result = await uploadToCloudinary(req.file.buffer, 'admissions/documents');
      sendSuccess(res, { url: result.secure_url }, 'Document uploaded');
    } catch (err) { next(err); }
  }
}
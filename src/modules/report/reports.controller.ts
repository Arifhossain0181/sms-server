import { Request, Response, NextFunction } from 'express';
import * as ReportsService from './reports.service';

export class ReportsController {
  async exportStudentsPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.query.classId as string | undefined;
      const studentId = req.query.studentId as string | undefined;
      await ReportsService.exportStudentsPdf(res, classId, studentId);
    } catch (err) {
      next(err);
    }
  }

  async exportStudentsCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.query.classId as string | undefined;
      const studentId = req.query.studentId as string | undefined;
      await ReportsService.exportStudentsCsv(res, classId, studentId);
    } catch (err) {
      next(err);
    }
  }

  async exportAttendancePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, sectionId, date } = req.query as Record<string, string>;
      const studentId = req.query.studentId as string | undefined;
      if (!classId || !sectionId || !date) {
        res.status(400).json({ success: false, message: 'classId, sectionId, and date are required' });
        return;
      }
      await ReportsService.exportAttendancePdf(res, classId, sectionId, date, studentId);
    } catch (err) {
      next(err);
    }
  }

  async exportAttendanceCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, sectionId, date } = req.query as Record<string, string>;
      const studentId = req.query.studentId as string | undefined;
      if (!classId || !sectionId || !date) {
        res.status(400).json({ success: false, message: 'classId, sectionId, and date are required' });
        return;
      }
      await ReportsService.exportAttendanceCsv(res, classId, sectionId, date, studentId);
    } catch (err) {
      next(err);
    }
  }

  async exportFeesPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.query.studentId as string | undefined;
      await ReportsService.exportFeesPdf(res, studentId);
    } catch (err) {
      next(err);
    }
  }

  async exportFeesCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.query.studentId as string | undefined;
      await ReportsService.exportFeesCsv(res, studentId);
    } catch (err) {
      next(err);
    }
  }

  async exportResultsPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = req.query.examId as string | undefined;
      const studentId = req.query.studentId as string | undefined;
      await ReportsService.exportResultsPdf(res, examId, studentId);
    } catch (err) {
      next(err);
    }
  }

  async exportResultsCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = req.query.examId as string | undefined;
      const studentId = req.query.studentId as string | undefined;
      await ReportsService.exportResultsCsv(res, examId, studentId);
    } catch (err) {
      next(err);
    }
  }
}

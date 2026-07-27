import { Request, Response, NextFunction } from 'express';
import * as ReportsService from './reports.service';

export class ReportsController {
  async exportStudentsPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.query.classId as string | undefined;
      await ReportsService.exportStudentsPdf(res, classId);
    } catch (err) {
      next(err);
    }
  }

  async exportStudentsCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.query.classId as string | undefined;
      await ReportsService.exportStudentsCsv(res, classId);
    } catch (err) {
      next(err);
    }
  }

  async exportAttendancePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, sectionId, date } = req.query as Record<string, string>;
      if (!classId || !sectionId || !date) {
        res.status(400).json({ success: false, message: 'classId, sectionId, and date are required' });
        return;
      }
      await ReportsService.exportAttendancePdf(res, classId, sectionId, date);
    } catch (err) {
      next(err);
    }
  }

  async exportAttendanceCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, sectionId, date } = req.query as Record<string, string>;
      if (!classId || !sectionId || !date) {
        res.status(400).json({ success: false, message: 'classId, sectionId, and date are required' });
        return;
      }
      await ReportsService.exportAttendanceCsv(res, classId, sectionId, date);
    } catch (err) {
      next(err);
    }
  }

  async exportFeesPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ReportsService.exportFeesPdf(res);
    } catch (err) {
      next(err);
    }
  }

  async exportFeesCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ReportsService.exportFeesCsv(res);
    } catch (err) {
      next(err);
    }
  }

  async exportResultsPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = req.query.examId as string | undefined;
      await ReportsService.exportResultsPdf(res, examId);
    } catch (err) {
      next(err);
    }
  }

  async exportResultsCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = req.query.examId as string | undefined;
      await ReportsService.exportResultsCsv(res, examId);
    } catch (err) {
      next(err);
    }
  }
}

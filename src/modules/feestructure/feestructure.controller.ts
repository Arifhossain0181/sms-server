import { Request, Response, NextFunction } from 'express';
import { FeeStructureService } from './feestructure.service';
import { sendSuccess } from '../../utils/response.util';

export class FeeStructureController {
  // ── ACCOUNTANT / SCHOOL_ADMIN: create 
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const structure = await FeeStructureService.create(req.body);
      sendSuccess(res, structure, 'Fee structure created', 201);
    } catch (err) { next(err); }
  }

  // ── ACCOUNTANT / SCHOOL_ADMIN: update 
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const structure = await FeeStructureService.update(req.params.id as string, req.body);
      sendSuccess(res, structure, 'Fee structure updated');
    } catch (err) { next(err); }
  }

  // ── ACCOUNTANT / SCHOOL_ADMIN: delete ───────────────────────────
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await FeeStructureService.delete(req.params.id as string);
      sendSuccess(res, null, 'Fee structure deleted');
    } catch (err) { next(err); }
  }

  // ── list / filter, paginated 
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, feeType, academicYear, page, pageSize } = req.query as any;
      const result = await FeeStructureService.findAll({
        classId, feeType, academicYear,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, result, 'Fee structures fetched');
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const structure = await FeeStructureService.findById(req.params.id as string);
      sendSuccess(res, structure, 'Fee structure fetched');
    } catch (err) { next(err); }
  }

  // ── any authenticated role: fee templates for a given class ─────
  async findByClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query as any;
      const data = await FeeStructureService.findByClass(
        req.params.classId as string,
        month ? Number(month) : undefined,
        year ? Number(year) : undefined
      );
      sendSuccess(res, data, 'Class fee structures fetched');
    } catch (err) { next(err); }
  }
}
import { Request, Response, NextFunction } from 'express';
import {
  createfee,
  bulkcreate,
  findAll,
  findByid,
  updateFee,
  deleteFee,
  recordPayment,
  getstudentFeeSummary,
  getCollectionReport
} from './fee.service';
import { sendSuccess } from '../../utils/response.util';




export class FeesController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const fee = await createfee(req.body);
      sendSuccess(res, fee, 'Fee created', 201);
    } catch (err) { next(err); }
  }

  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bulkcreate(req.body);
      sendSuccess(res, result, `Fees assigned to ${result.created} students`, 201);
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await findAll(req.query as any);
      sendSuccess(res, data, 'Fees fetched');
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      const fee = await findByid(idStr);
      sendSuccess(res, fee, 'Fee fetched');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      const fee = await updateFee(idStr, req.body);
      sendSuccess(res, fee, 'Fee updated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params as { id: string | string[] };
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) throw new Error('id param required');
      await deleteFee(idStr);
      sendSuccess(res, null, 'Fee deleted');
    } catch (err) { next(err); }
  }

  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await recordPayment(req.body);
      sendSuccess(res, payment, 'Payment recorded', 201);
    } catch (err) { next(err); }
  }

  async getStudentSummary(req: Request, res: Response, next: NextFunction) {
    try {
      let { studentId } = req.params as { studentId: string | string[] };
      const studentIdStr = Array.isArray(studentId) ? studentId[0] : studentId;
      if (!studentIdStr) throw new Error('studentId param required');
      const data = await getstudentFeeSummary(studentIdStr);
      sendSuccess(res, data, 'Fee summary fetched');
    } catch (err) { next(err); }
  }

  async getCollectionReport(req: Request, res: Response, next: NextFunction) {
    try {
      let { month, type } = req.query as { month: string | string[], type?: string | string[] };
      const monthStr = Array.isArray(month) ? month[0] : month;
      const typeStr = type ? (Array.isArray(type) ? type[0] : type) : '';
      if (!monthStr) throw new Error('month query param required (e.g. 2024-09)');
      const data = await getCollectionReport(monthStr, typeStr);
      sendSuccess(res, data, 'Collection report fetched');
    } catch (err) { next(err); }
  }
}
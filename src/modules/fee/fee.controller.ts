import { Request, Response, NextFunction } from 'express';
import {
  createfee,
  bulkcreate,
  findAll,
  findByid,
  updateFee,
  deleteFee,
  recordPayment,
  recordCashPayment,
  getstudentFeeSummary,
  getStudentFeeList,
  getCollectionReport,
  getFeeSummary,
  getOverdueFees as getOverdueFeesService,
  getAllPayments as getTransactionsService,
  getMonthlyAnalytics as getMonthlyAnalyticsService,
  createPaymentIntent as createPaymentIntentService,
  handleStripeWebhook as handleStripeWebhookService,
} from './fee.service';
import { StudentService } from '../student/student.service';
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

      if (req.user?.role === 'STUDENT' && fee.studentId !== req.user.studentId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

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
      if (!req.user?.id) throw new Error('Authenticated user not found on request');
      const payment = await recordPayment(req.body, req.user.id);
      sendSuccess(res, payment, 'Payment recorded', 201);
    } catch (err) { next(err); }
  }

  async recordCashPayment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new Error('Authenticated user not found on request');
      const payment = await recordCashPayment(req.body, req.user.id);
      sendSuccess(res, payment, 'Cash payment recorded', 201);
    } catch (err) { next(err); }
  }

  async getStudentSummary(req: Request, res: Response, next: NextFunction) {
    try {
      let { studentId } = req.params as { studentId: string | string[] };
      const studentIdStr = Array.isArray(studentId) ? studentId[0] : studentId;
      if (!studentIdStr) throw new Error('studentId param required');

      if (req.user?.role === 'STUDENT' && req.user.studentId !== studentIdStr) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const data = await getstudentFeeSummary(studentIdStr);
      sendSuccess(res, data, 'Fee summary fetched');
    } catch (err) { next(err); }
  }

  async getCollectionReport(req: Request, res: Response, next: NextFunction) {
    try {
      let { month, type } = req.query as { month: string | string[], type?: string | string[] };
      const monthStr = Array.isArray(month) ? month[0] : month;
      const typeStr = type ? (Array.isArray(type) ? type[0] : type) : undefined;
      if (!monthStr) throw new Error('month query param required (e.g. 2024-09)');
      const data = await getCollectionReport(monthStr, typeStr);
      sendSuccess(res, data, 'Collection report fetched');
    } catch (err) { next(err); }
  }

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      let { month } = req.query as { month?: string | string[] };
      const monthStr = month ? (Array.isArray(month) ? month[0] : month) : undefined;
      const data = await getFeeSummary(monthStr);
      sendSuccess(res, data, 'Fee summary fetched');
    } catch (err) { next(err); }
  }

  async getOverdueFees(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getOverdueFeesService(req.query as any);
      sendSuccess(res, data, 'Overdue fees fetched');
    } catch (err) { next(err); }
  }

  async getMyFees(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.studentId || (req.user?.id ? await StudentService.getStudentIdByUserId(req.user.id) : null);
      if (!studentId) {
        return res.status(403).json({ success: false, message: 'Student profile not found' });
      }
      const data = await getstudentFeeSummary(studentId);
      sendSuccess(res, data, 'Your fees fetched');
    } catch (err) { next(err); }
  }

  async getMyFeeList(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.studentId || (req.user?.id ? await StudentService.getStudentIdByUserId(req.user.id) : null);
      if (!studentId) {
        return res.status(403).json({ success: false, message: 'Student profile not found' });
      }
      const data = await getStudentFeeList(studentId);
      sendSuccess(res, data, 'Your fee list fetched');
    } catch (err) { next(err); }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getTransactionsService(req.query as any);
      sendSuccess(res, data, 'Transactions fetched');
    } catch (err) { next(err); }
  }

  async getMonthlyAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const yearStr = req.query.year as string | undefined;
      const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
      const data = await getMonthlyAnalyticsService(year);
      sendSuccess(res, data, 'Analytics fetched');
    } catch (err) { next(err); }
  }

  async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { feeId } = req.body;
      if (!feeId) throw new Error('feeId is required');
      
      const studentId = req.user?.studentId || req.user?.id; // Allow parents or students
      if (!studentId) throw new Error('Student identity not found on request');
      
      // If a parent is paying, we might need to verify the fee actually belongs to their child.
      // But the service does `if (fee.studentId !== studentId)`, so if user is a PARENT, we need 
      // their child's studentId. Let's assume req.body.studentId can be passed by parent, or 
      // the parent route handles it differently.
      // Let's pass the studentId from body if it's there, else from user.
      const targetStudentId = req.body.studentId || studentId;

      const paymentIntentData = await createPaymentIntentService(feeId, targetStudentId);
      sendSuccess(res, paymentIntentData, 'Payment Intent created');
    } catch (err) { next(err); }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        return res.status(400).send('Missing stripe signature');
      }

      // Important: rawBody must be available. 
      // This requires setting up express.raw() in the route.
      const rawBody = req.body;
      
      await handleStripeWebhookService(
        Array.isArray(signature) ? signature[0] : signature, 
        rawBody
      );

      res.status(200).send({ received: true });
    } catch (err: any) {
      console.error('Stripe Webhook Error:', err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
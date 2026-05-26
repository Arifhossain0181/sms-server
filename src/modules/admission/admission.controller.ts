import { Request, Response, NextFunction } from 'express';
import { AdmissionService } from './admission.service';
import { sendSuccess } from '../../utils/response.util';
import { uploadToCloudinary } from '../../config/cloudinary';
import stripe from '../../config/striPe';

const admissionService = new AdmissionService();

export class AdmissionController {
  /** Public — no auth required */
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate required fields
      const { applicantName, studentEmail, guardianName, guardianEmail, guardianPhone, targetClassId, address, gender, dob } = req.body;
      
      if (!studentEmail) {
        const err = new Error("studentEmail is required for login after approval");
        (err as any).status = 400;
        throw err;
      }

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
      const admission = await admissionService.findById(String(req.params.id));
      sendSuccess(res, admission, 'Admission fetched');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await admissionService.update(String(req.params.id), req.body);
      sendSuccess(res, admission, 'Admission updated');
    } catch (err) { next(err); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await admissionService.updateStatus(
        String(req.params.id),
        req.body
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
      await admissionService.delete(String(req.params.id));
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

  async getPublicClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const classes = await admissionService.getPublicClasses();
      sendSuccess(res, classes, 'Classes fetched');
    } catch (err) { next(err); }
  }

  async createStripeCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const amount = Number(req.body?.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              unit_amount: Math.round(amount * 100),
              product_data: {
                name: 'Admission Fee',
                description: req.body?.targetClassId ? `Class: ${req.body.targetClassId}` : undefined,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${frontendUrl}/apply-for-admission?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/apply-for-admission?payment=cancel`,
        metadata: {
          applicantName: req.body?.applicantName ?? '',
          targetClassId: req.body?.targetClassId ?? '',
        },
      });

      sendSuccess(res, { url: session.url, sessionId: session.id }, 'Stripe session created');
    } catch (err) { next(err); }
  }

  async verifyStripeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = String(req.query.session_id || '');
      if (!sessionId) throw new Error('Missing session_id');

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paid = session.payment_status === 'paid';

      sendSuccess(res, {
        paid,
        amountTotal: session.amount_total ? session.amount_total / 100 : null,
        currency: session.currency,
        sessionId: session.id,
      }, 'Stripe session verified');
    } catch (err) { next(err); }
  }
}
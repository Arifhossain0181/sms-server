import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { CriticalActionStatus } from '@prisma/client';

export class EscalationController {
  async getPendingEscalations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pendingActions = await prisma.criticalAction.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ success: true, data: pendingActions, message: 'Pending escalations fetched' });
    } catch (error) {
      next(error);
    }
  }

  async resolveEscalation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const escalationId = id as string;
      const { status, reviewComment } = req.body;
      const user = (req as any).user;

      if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
        res.status(400).json({ success: false, message: 'Valid status (APPROVED/REJECTED) is required' });
        return;
      }

      const escalation = await prisma.criticalAction.findUnique({ where: { id: escalationId } });
      if (!escalation) {
        res.status(404).json({ success: false, message: 'Escalation not found' });
        return;
      }

      const updated = await prisma.criticalAction.update({
        where: { id: escalationId },
        data: { 
          status: status as CriticalActionStatus, 
          reviewComment,
          reviewedBy: user?.id || 'Admin'
        }
      });

      res.status(200).json({ success: true, data: updated, message: `Escalation ${status.toLowerCase()} successfully` });
    } catch (error) {
      next(error);
    }
  }
}

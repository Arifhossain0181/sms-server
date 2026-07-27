import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { Role } from '@prisma/client';

export class RoleController {
  async assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, newRole } = req.body;
      if (!userId || !newRole) {
        res.status(400).json({ success: false, message: 'userId and newRole are required' });
        return;
      }

      // Check if role is valid
      if (!Object.values(Role).includes(newRole)) {
        res.status(400).json({ success: false, message: 'Invalid role' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole as Role },
        select: { id: true, name: true, email: true, role: true }
      });

      res.status(200).json({ success: true, data: updatedUser, message: 'Role assigned successfully' });
    } catch (error) {
      next(error);
    }
  }

  async revokeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ success: false, message: 'userId is required' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Revoking a specialized role usually means falling back to a default role, e.g. TEACHER or just PARENT.
      // We will set it to TEACHER if it's a staff member.
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: Role.TEACHER }, // fallback role
        select: { id: true, name: true, email: true, role: true }
      });

      res.status(200).json({ success: true, data: updatedUser, message: 'Role revoked successfully (reset to TEACHER)' });
    } catch (error) {
      next(error);
    }
  }
}

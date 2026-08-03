import { Request, Response, NextFunction } from "express";
import * as service from "./superAdmin.service";

const param = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

export class SuperAdminController {
  // ─── Schools ──────────────────────────────────────────────────
  async getSchools(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.getAllSchools();
      res.status(200).json({ success: true, data, message: "Schools fetched" });
    } catch (err) {
      next(err);
    }
  }

  async getSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.getSchoolById(param(req.params.schoolId));
      if (!data) {
        res.status(404).json({ success: false, message: "School not found" });
        return;
      }
      res.status(200).json({ success: true, data, message: "School fetched" });
    } catch (err) {
      next(err);
    }
  }

  async createSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.createSchool(req.body);
      res.status(201).json({ success: true, data, message: "School created" });
    } catch (err) {
      next(err);
    }
  }

  async updateSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.updateSchool(param(req.params.schoolId), req.body);
      res.status(200).json({ success: true, data, message: "School updated" });
    } catch (err) {
      next(err);
    }
  }

  async suspendSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.suspendSchool(param(req.params.schoolId));
      res.status(200).json({ success: true, data, message: "School suspended" });
    } catch (err) {
      next(err);
    }
  }

  async reactivateSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.reactivateSchool(param(req.params.schoolId));
      res.status(200).json({ success: true, data, message: "School reactivated" });
    } catch (err) {
      next(err);
    }
  }

  async deleteSchool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.deleteSchool(param(req.params.schoolId));
      res.status(200).json({ success: true, message: "School deleted" });
    } catch (err) {
      next(err);
    }
  }

  // ─── School Admins ────────────────────────────────────────────
  async createSchoolAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.createSchoolAdmin(req.body);
      res.status(201).json({ success: true, data, message: "School Admin created" });
    } catch (err) {
      next(err);
    }
  }

  async updateSchoolAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.updateSchoolAdmin(param(req.params.userId), req.body);
      res.status(200).json({ success: true, data, message: "School Admin updated" });
    } catch (err) {
      next(err);
    }
  }

  async deactivateSchoolAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.deactivateSchoolAdmin(param(req.params.userId));
      res.status(200).json({ success: true, data, message: "School Admin deactivated" });
    } catch (err) {
      next(err);
    }
  }

  // ─── All Users ────────────────────────────────────────────────
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, schoolId, isActive } = req.query;
      const data = await service.getAllUsers({
        role: typeof role === "string" ? role : undefined,
        schoolId: typeof schoolId === "string" ? schoolId : undefined,
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      });
      res.status(200).json({ success: true, data, message: "Users fetched" });
    } catch (err) {
      next(err);
    }
  }

  // ─── Audit Logs ───────────────────────────────────────────────
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, action, limit, page } = req.query;
      const data = await service.getAuditLogs({
        userId: typeof userId === "string" ? userId : undefined,
        action: typeof action === "string" ? action : undefined,
        limit: typeof limit === "string" ? parseInt(limit) : undefined,
        page: typeof page === "string" ? parseInt(page) : undefined,
      });
      res.status(200).json({ success: true, data, message: "Audit logs fetched" });
    } catch (err) {
      next(err);
    }
  }

  // ─── RBAC ─────────────────────────────────────────────────────
  async updateRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, permissions } = req.body;
      const data = await service.updateRolePermissions(role, permissions);
      res.status(200).json({ success: true, data, message: "Permissions updated" });
    } catch (err) {
      next(err);
    }
  }

  // ─── Backup ───────────────────────────────────────────────────
  async triggerBackup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.triggerBackup(req.user!.id);
      res.status(200).json({ success: true, data, message: "Backup triggered" });
    } catch (err) {
      next(err);
    }
  }

  // ─── System Settings ──────────────────────────────────────────
  async getSystemSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.getSystemSettings();
      res.status(200).json({ success: true, data, message: "Settings fetched" });
    } catch (err) {
      next(err);
    }
  }

  async updateSystemSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = param(req.params.key);
      const { value, description } = req.body;
      const data = await service.updateSystemSetting(key, value, req.user!.id, description);
      res.status(200).json({ success: true, data, message: "Setting updated" });
    } catch (err) {
      next(err);
    }
  }

  // ─── Analytics ────────────────────────────────────────────────
  async getPlatformAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.getPlatformAnalytics();
      res.status(200).json({ success: true, data, message: "Analytics fetched" });
    } catch (err) {
      next(err);
    }
  }

  // ─── Revenue ──────────────────────────────────────────────────
  async getRevenueReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.getRevenueReport();
      res.status(200).json({ success: true, data, message: "Revenue report fetched" });
    } catch (err) {
      next(err);
    }
  }

  // ─── Subscriptions ────────────────────────────────────────────
  async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.createSubscription(req.body);
      res.status(201).json({ success: true, data, message: "Subscription created" });
    } catch (err) {
      next(err);
    }
  }

  async updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await service.updateSubscription(param(req.params.subscriptionId), req.body);
      res.status(200).json({ success: true, data, message: "Subscription updated" });
    } catch (err) {
      next(err);
    }
  }
}

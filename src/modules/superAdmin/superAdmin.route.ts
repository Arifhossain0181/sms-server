import { Router } from "express";
import { SuperAdminController } from "./superAdmin.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();
const controller = new SuperAdminController();

router.use(authenticate);
router.use(authorizeRoles("SUPER_ADMIN"));

// Schools
router.get("/schools", controller.getSchools.bind(controller));
router.post("/schools", controller.createSchool.bind(controller));
router.post("/schools/:schoolId/suspend", controller.suspendSchool.bind(controller));
router.post("/schools/:schoolId/reactivate", controller.reactivateSchool.bind(controller));
router.get("/schools/:schoolId", controller.getSchool.bind(controller));
router.put("/schools/:schoolId", controller.updateSchool.bind(controller));
router.delete("/schools/:schoolId", controller.deleteSchool.bind(controller));

// School Admins
router.post("/schools/:schoolId/admins", controller.createSchoolAdmin.bind(controller));
router.put("/admins/:userId", controller.updateSchoolAdmin.bind(controller));
router.post("/admins/:userId/deactivate", controller.deactivateSchoolAdmin.bind(controller));

// Users
router.get("/users", controller.getAllUsers.bind(controller));

// Audit Logs
router.get("/audit-logs", controller.getAuditLogs.bind(controller));

// RBAC
router.put("/rbac/:role", controller.updateRolePermissions.bind(controller));

// Backup
router.post("/backup", controller.triggerBackup.bind(controller));

// System Settings
router.get("/settings", controller.getSystemSettings.bind(controller));
router.put("/settings/:key", controller.updateSystemSetting.bind(controller));

// Analytics
router.get("/analytics", controller.getPlatformAnalytics.bind(controller));

// Revenue
router.get("/revenue", controller.getRevenueReport.bind(controller));

// Subscriptions
router.post("/subscriptions", controller.createSubscription.bind(controller));
router.put("/subscriptions/:subscriptionId", controller.updateSubscription.bind(controller));

export default router;

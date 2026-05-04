import { Router } from "express";
import * as controller from "./teachingApplication.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();

// Public: submit teaching application
router.post("/apply", controller.apply);

// Admin: review applications
router.get("/", authenticate, authorizeRoles("ADMIN"), controller.list);
router.get("/:id", authenticate, authorizeRoles("ADMIN"), controller.getById);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN"), controller.updateStatus);

export default router;

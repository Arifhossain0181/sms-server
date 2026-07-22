import { Router } from "express";
import * as gradingController from "./grading.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();

const EXAM_STAFF = ["EXAM_CONTROLLER", "SCHOOL_ADMIN", "SUPER_ADMIN"] as const;

router.use(authenticate);
router.post("/", authorizeRoles(...EXAM_STAFF), gradingController.createGradingRule);
router.post("/bulk", authorizeRoles(...EXAM_STAFF), gradingController.bulkUpsertGradingRules);
router.get("/", authorizeRoles(...EXAM_STAFF), gradingController.listGradingRules);
router.put("/:id", authorizeRoles(...EXAM_STAFF), gradingController.updateGradingRule);
router.delete("/:id", authorizeRoles(...EXAM_STAFF), gradingController.deleteGradingRule);

export const gradingRoutes = router;

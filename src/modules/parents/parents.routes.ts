import { Router } from "express";
import { ParentsController } from "./parents.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();
const c = new ParentsController();

router.use(authenticate);

// ── PARENT: self-service (own data only, resolved from req.user) ───
router.get("/me", authorizeRoles("PARENT"), c.getMyProfile.bind(c));
router.patch("/me", authorizeRoles("PARENT"), c.updateMyProfile.bind(c));
router.get("/me/children", authorizeRoles("PARENT"), c.getMyChildren.bind(c));
router.get("/me/payments", authorizeRoles("PARENT"), c.getMyPayments.bind(c));
router.get("/me/notices", authorizeRoles("PARENT"), c.getMyNotices.bind(c));

// ── ADMIN: full CRUD + child linking ─────────────────────────────────
router.get("/", authorizeRoles("ADMIN"), c.findAll.bind(c));
router.post("/", authorizeRoles("ADMIN"), c.create.bind(c));
router.get("/:id", authorizeRoles("ADMIN"), c.findById.bind(c));
router.patch("/:id", authorizeRoles("ADMIN"), c.update.bind(c));
router.delete("/:id", authorizeRoles("ADMIN"), c.delete.bind(c));
router.post("/:id/children", authorizeRoles("ADMIN"), c.linkChild.bind(c));
router.delete(
  "/:id/children/:studentId",
  authorizeRoles("ADMIN"),
  c.unlinkChild.bind(c),
);

export default router;

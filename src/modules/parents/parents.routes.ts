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
router.get("/me/children-detailed", authorizeRoles("PARENT"), c.getMyChildrenDetailed.bind(c));
router.get("/me/alerts", authorizeRoles("PARENT"), c.getLowAttendanceAlerts.bind(c));

// Child academic data (parent can only access their own children)
router.get("/me/children/:childId/profile", authorizeRoles("PARENT"), c.getChildProfile.bind(c));
router.get("/me/children/:childId/attendance", authorizeRoles("PARENT"), c.getChildAttendance.bind(c));
router.get("/me/children/:childId/results", authorizeRoles("PARENT"), c.getChildResults.bind(c));
router.get("/me/children/:childId/class-highest", authorizeRoles("PARENT"), c.getChildClassHighestMarks.bind(c));
router.get("/me/children/:childId/homework", authorizeRoles("PARENT"), c.getChildHomework.bind(c));
router.get("/me/children/:childId/timetable", authorizeRoles("PARENT"), c.getChildTimetable.bind(c));
router.get("/me/children/:childId/report-cards", authorizeRoles("PARENT"), c.getChildReportCards.bind(c));
router.get("/me/children/:childId/admit-cards", authorizeRoles("PARENT"), c.getChildAdmitCards.bind(c));

// Parent payment
router.post("/me/create-payment-intent", authorizeRoles("PARENT"), c.createParentPaymentIntent.bind(c));

router.get("/me/payments", authorizeRoles("PARENT"), c.getMyPayments.bind(c));
router.get("/me/notices", authorizeRoles("PARENT"), c.getMyNotices.bind(c));
router.post("/me/contact", authorizeRoles("PARENT"), c.contactSchool.bind(c));

// ── ADMIN / EXAM_CONTROLLER: full CRUD + child linking ─────────────────────────────────
router.get("/", authorizeRoles("SCHOOL_ADMIN", "EXAM_CONTROLLER"), c.findAll.bind(c));
router.get("/:id", authorizeRoles("SCHOOL_ADMIN", "EXAM_CONTROLLER"), c.findById.bind(c));

export default router;

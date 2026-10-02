import { Router } from "express";
import { upload } from "../../lib/uPload";
import { submitHomework, getSubmission, regrade, overrideMarks } from "./submission.controller";
// import { auth, authorize } from "../middlewares/auth";

const router = Router();

router.post("/assignments/:assignmentId/submit", /* auth, authorize("STUDENT"), */ upload.single("file"), submitHomework);
router.get("/submissions/:id", /* auth, */ getSubmission);
router.post("/submissions/:id/regrade", /* auth, authorize("TEACHER"), */ regrade);
router.patch("/submissions/:id/override", /* auth, authorize("TEACHER"), */ overrideMarks);

export default router;
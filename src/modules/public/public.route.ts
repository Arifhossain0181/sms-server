import { Router } from "express";
import { getSchoolOverview } from "./public.controller";

const router = Router();

router.get("/school-overview", getSchoolOverview);

export default router;
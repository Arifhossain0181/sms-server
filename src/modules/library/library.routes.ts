import { Router } from "express";
import { LibraryController } from "./library.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();
const controller = new LibraryController();

router.use(authenticate);

router.get("/my-books", authorizeRoles("STUDENT"), controller.getMyIssuedBooks.bind(controller));

export default router;

import { Request, Response, NextFunction } from "express";
import { getMyIssuedBooks } from "./library.service";
import { sendSuccess } from "../../utils/response.util";
import { StudentService } from "../student/student.service";

export class LibraryController {
    async getMyIssuedBooks(req: Request, res: Response, next: NextFunction) {
        try {
            const studentId = await StudentService.getStudentIdByUserId((req.user as any)?.id);
            if (!studentId) {
                return res.status(403).json({ success: false, message: "Student profile not found" });
            }

            const data = await getMyIssuedBooks(studentId);
            sendSuccess(res, data, "Your issued books fetched");
        } catch (err) {
            next(err);
        }
    }
}

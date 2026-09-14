import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";

export const schoolScope = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return next();
    }

    if (!user.schoolId) {
      if (user.role === "SCHOOL_ADMIN") {
        return res.status(403).json({ message: "School assignment is required." });
      }
      return next();
    }

    const school = await prisma.school.findUnique({
      where: { id: user.schoolId },
      select: { id: true, isActive: true },
    });

    if (!school) {
      return res.status(403).json({ message: "School not found. Access denied." });
    }

    if (!school.isActive) {
      return res.status(403).json({ message: "School is suspended. Access denied." });
    }

    (req as any).schoolId = user.schoolId;
    next();
  } catch (err) {
    next(err);
  }
};

export const getSchoolId = (req: Request): string | undefined => {
  return (req as any).schoolId ?? req.user?.schoolId;
};


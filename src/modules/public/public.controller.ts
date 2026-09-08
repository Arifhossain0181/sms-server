import { Request, Response, NextFunction } from "express";
import prisma from "../../config/db";

export async function getSchoolOverview(_req: Request, res: Response, next: NextFunction) {
  try {
    const school = await prisma.school.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        principalName: true,
        academicYear: true,
      },
    });

    const schoolFilter = school
      ? { OR: [{ schoolId: school.id }, { schoolId: null }] }
      : {};
    const [teachers, studentCount] = await Promise.all([
      prisma.teacher.findMany({
        where: { ...schoolFilter, isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          designation: true,
          department: true,
          departmentRef: { select: { name: true } },
        },
      }),
      prisma.student.count({ where: { ...schoolFilter, isActive: true } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        school,
        counts: { teachers: teachers.length, students: studentCount },
        teachers: teachers.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          designation: teacher.designation,
          department: teacher.departmentRef?.name ?? teacher.department ?? "General",
        })),
      },
      message: "School overview fetched",
    });
  } catch (err) {
    next(err);
  }
}
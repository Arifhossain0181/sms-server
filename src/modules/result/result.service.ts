import prisma from "../../config/db";
import { SubmitResultDto, UpdateMarkDto } from "./result.dto";
import { getIO } from "../../config/socket";

const calculateGrade = (percentage: number): { grade: string; gpa: number } => {
  if (percentage >= 80) return { grade: "A+", gpa: 5.0 };
  if (percentage >= 70) return { grade: "A", gpa: 4.0 };
  if (percentage >= 60) return { grade: "A-", gpa: 3.5 };
  if (percentage >= 50) return { grade: "B", gpa: 3.0 };
  if (percentage >= 40) return { grade: "C", gpa: 2.0 };
  if (percentage >= 33) return { grade: "D", gpa: 1.0 };
  return { grade: "F", gpa: 0.0 };
};

const recalculateAndSaveReportCard = async (
  studentId: string,
  examId: string,
) => {
  const marks = await prisma.mark.findMany({
    where: { studentId, examId },
    include: {
      subject: {
        select: {
          fullMarks: true,
          passMarks: true,
        },
      },
    },
  });

  const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalFull = marks.reduce((sum, m) => sum + m.subject.fullMarks, 0);
  const percentage =
    totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : 0;
  const failed = marks.some((m) => m.marksObtained < m.subject.passMarks);
  const { grade, gpa } = calculateGrade(percentage);

  const reportCard = await prisma.reportCard.upsert({
    where: {
      studentId_examId: {
        studentId,
        examId,
      },
    },
    create: {
      studentId,
      examId,
      gpa,
    },
    update: {
      gpa,
    },
  });

  return {
    reportCard,
    totalObtained,
    totalFull,
    percentage,
    grade,
    gpa,
    isPassed: !failed,
  };
};

export const submitResult = async (
  dto: SubmitResultDto,
  authUser?: { id: string; role: string },
) => {
  if (!dto.examId) throw { status: 400, message: "examId is required" };
  const exam = await prisma.exam.findUnique({ where: { id: dto.examId } });
  if (!exam) throw { status: 404, message: "Exam not found" };

  const student = await prisma.student.findUnique({
    where: { id: dto.studentId },
    select: { id: true },
  });
  if (!student) throw { status: 404, message: "Student not found" };

  if (!dto.marks.length)
    throw { status: 400, message: "At least one subject mark is required" };

  let currentTeacherId: string | undefined;
  if (authUser?.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: authUser.id },
      select: { id: true },
    });
    if (!teacher)
      throw { status: 403, message: "Teacher profile not found for this user" };
    currentTeacherId = teacher.id;
  }

  const subjects = await prisma.subject.findMany({
    where: { id: { in: dto.marks.map((m) => m.subjectId) } },
    include: {
      assignments: {
        select: {
          teacherId: true,
        },
      },
    },
  });

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  await prisma.$transaction(async (tx) => {
    for (const m of dto.marks) {
      const subject = subjectMap.get(m.subjectId);
      if (!subject)
        throw { status: 404, message: `Subject not found: ${m.subjectId}` };

      if (m.marksObtained < 0 || m.marksObtained > subject.fullMarks) {
        throw {
          status: 400,
          message: `Marks must be between 0 and ${subject.fullMarks} for ${subject.name}`,
        };
      }

      // Determine which teacher to use
      let teacherToAssign: string | undefined;

      // For TEACHER: Must be assigned to this subject
      if (currentTeacherId) {
        const isAssignedToSubject = subject.assignments.some(
          (a) => a.teacherId === currentTeacherId
        );
        if (!isAssignedToSubject) {
          throw {
            status: 403,
            message: `You are not assigned to teach ${subject.name}. Please use an assigned subject.`,
          };
        }
        teacherToAssign = currentTeacherId;
      } else {
        // For ADMIN: Use first assigned teacher, or allow any teacher if multiple
        if (subject.assignments.length > 0) {
          teacherToAssign = subject.assignments[0].teacherId;
        } else {
          // No teacher assigned to this subject - ADMIN must assign one first
          throw {
            status: 400,
            message: `No teacher assigned to subject "${subject.name}". Please assign a teacher to this subject first.`,
          };
        }
      }

      const percentage =
        subject.fullMarks > 0 ? (m.marksObtained / subject.fullMarks) * 100 : 0;
      const { grade, gpa } = calculateGrade(percentage);

      await tx.mark.upsert({
        where: {
          studentId_examId_subjectId: {
            studentId: dto.studentId,
            examId: dto.examId,
            subjectId: m.subjectId,
          },
        },
        create: {
          studentId: dto.studentId,
          examId: dto.examId,
          subjectId: m.subjectId,
          teacherId: teacherToAssign,
          marksObtained: m.marksObtained,
          grade,
          gpa,
        },
        update: {
          teacherId: teacherToAssign,
          marksObtained: m.marksObtained,
          grade,
          gpa,
        },
      });
    }
  });

  const summary = await recalculateAndSaveReportCard(dto.studentId, dto.examId);

  try {
    getIO().to(dto.studentId).emit("result:Published", {
      examId: dto.examId,
      grade: summary.grade,
      percentage: summary.percentage,
      gpa: summary.gpa,
      isPassed: summary.isPassed,
    });
  } catch (_) {
    // ignore socket errors
  }
  return {
    success:true,
    message:"result submitted successfll",
    summary
  }
};

export const submitBulkResult = async (
  dtos: SubmitResultDto[],
  authUser?: { id: string; role: string },
) => {
  if (!dtos || dtos.length === 0) {
    throw { status: 400, message: "No result entries provided" };
  }

  const results = [];
  for (let i = 0; i < dtos.length; i++) {
    try {
      const result = await submitResult(dtos[i], authUser);
      results.push(result);
    } catch (error: any) {
      // Re-throw with context about which student failed
      const errorMessage = error.message || 'Unknown error';
      throw {
        status: error.status || 400,
        message: `Student ${i + 1}: ${errorMessage}`,
      };
    }
  }

  return {
    success: true,
    message: `Marks submitted for ${results.length} student(s)`,
    totalProcessed: results.length,
    results,
  };
};

export const getResultByStudent = async (
  studentId: string,
  examId?: string,
  limit: number = 10,
) => {
  const marks = await prisma.mark.findMany({
    where: {
      studentId,
      ...(examId ? { examId } : {}),
    },
    select: {
      id: true,
      marksObtained: true,
      grade: true,
      exam: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, fullMarks: true, passMarks: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalFull = marks.reduce((sum, m) => sum + m.subject.fullMarks, 0);
  const percentage =
    totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : 0;

  return {
    studentId,
    examId: examId ?? null,
    totalObtained,
    totalFull,
    percentage,
    marks,
  };
};

export const getResultByExam = async (examId: string) => {
  const marks = await prisma.mark.findMany({
    where: { examId },
    include: {
      student: true,
      subject: true,
    },
  });

  const grouped = new Map<
    string,
    {
      student: (typeof marks)[number]["student"];
      marks: Array<{
        id: string;
        subjectId: string;
        subjectName: string;
        marksObtained: number;
        fullMarks: number;
        passMarks: number;
        grade: string | null;
        gpa: number | null;
      }>;
      totalMarks: number;
      fullMarks: number;
      gpa: number;
      isPassed: boolean;
    }
  >();

  for (const mark of marks) {
    const current = grouped.get(mark.studentId);
    const pass = mark.marksObtained >= mark.subject.passMarks;
    const markEntry = {
      id: mark.id,
      subjectId: mark.subjectId,
      subjectName: mark.subject.name,
      marksObtained: mark.marksObtained,
      fullMarks: mark.subject.fullMarks,
      passMarks: mark.subject.passMarks,
      grade: mark.grade,
      gpa: mark.gpa,
    };

    if (!current) {
      grouped.set(mark.studentId, {
        student: mark.student,
        marks: [markEntry],
        totalMarks: mark.marksObtained,
        fullMarks: mark.subject.fullMarks,
        gpa: mark.gpa ?? 0,
        isPassed: pass,
      });
      continue;
    }

    current.marks.push(markEntry);
    current.totalMarks += mark.marksObtained;
    current.fullMarks += mark.subject.fullMarks;
    current.isPassed = current.isPassed && pass;
  }

  const results = Array.from(grouped.values())
    .map((item) => {
      const percentage =
        item.fullMarks > 0
          ? Math.round((item.totalMarks / item.fullMarks) * 100)
          : 0;
      const calculated = calculateGrade(percentage);
      return {
        student: item.student,
        marks: item.marks,
        totalMarks: item.totalMarks,
        fullMarks: item.fullMarks,
        percentage,
        grade: calculated.grade,
        gpa: calculated.gpa,
        isPassed: item.isPassed,
      };
    })
    .sort((a, b) => b.gpa - a.gpa);

  const total = results.length;
  const passed = results.filter((r) => r.isPassed).length;
  const failed = total - passed;
  const avgGpa =
    total > 0
      ? Number((results.reduce((sum, r) => sum + r.gpa, 0) / total).toFixed(2))
      : 0;

  return { results, summary: { total, passed, failed, avgGpa } };
};

export const updateMark = async (id: string, dto: UpdateMarkDto) => {
  const mark = await prisma.mark.findUnique({
    where: { id },
    include: {
      subject: {
        select: {
          fullMarks: true,
        },
      },
    },
  });
  if (!mark) throw { status: 404, message: "Mark record not found" };

  if (dto.marksObtained < 0 || dto.marksObtained > mark.subject.fullMarks) {
    throw { status: 400, message: "Marks exceed full marks" };
  }

  const percentage =
    mark.subject.fullMarks > 0
      ? (dto.marksObtained / mark.subject.fullMarks) * 100
      : 0;
  const { grade, gpa } = calculateGrade(percentage);

  const updated = await prisma.mark.update({
    where: { id },
    data: {
      marksObtained: dto.marksObtained,
      grade,
      gpa,
    },
  });

  const summary = await recalculateAndSaveReportCard(
    updated.studentId,
    updated.examId,
  );
  return { mark: updated, summary };
};

export const getFailedStudents = async (examId: string) => {
  const marks = await prisma.mark.findMany({
    where: { examId },
    include: {
      student: true,
      subject: {
        select: {
          id: true,
          name: true,
          passMarks: true,
        },
      },
    },
  });

  const grouped = new Map<
    string,
    {
      student: (typeof marks)[number]["student"];
      marks: Array<{
        id: string;
        subjectId: string;
        subjectName: string;
        marksObtained: number;
        passMarks: number;
      }>;
    }
  >();

  for (const mark of marks) {
    if (mark.marksObtained >= mark.subject.passMarks) continue;

    const current = grouped.get(mark.studentId);
    const markEntry = {
      id: mark.id,
      subjectId: mark.subject.id,
      subjectName: mark.subject.name,
      marksObtained: mark.marksObtained,
      passMarks: mark.subject.passMarks,
    };

    if (!current) {
      grouped.set(mark.studentId, {
        student: mark.student,
        marks: [markEntry],
      });
      continue;
    }

    current.marks.push(markEntry);
  }

  return Array.from(grouped.values());
};

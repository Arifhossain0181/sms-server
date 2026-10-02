import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { gradeHomework } from "./ai-grader.service";

const prisma = new PrismaClient();

async function autoGrade(submissionId: string) {
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: true },
  });
  if (!sub) return;

  try {
    const { marks, feedback } = await gradeHomework({
      filePath: sub.filePath,
      mimeType: sub.mimeType,
      title: sub.assignment.title,
      description: sub.assignment.description,
      rubric: sub.assignment.rubric,
      maxMarks: sub.assignment.maxMarks,
    });

    await prisma.submission.update({
      where: { id: sub.id },
      data: { marks, feedback, status: "GRADED", gradedAt: new Date() },
    });
  } catch (e) {
    console.error("AI grading failed:", e);
    await prisma.submission.update({ where: { id: sub.id }, data: { status: "FAILED" } });
  }
}

// POST /assignments/:assignmentId/submit  (student)
export const submitHomework = async (req: Request, res: Response) => {
  const assignmentId = String(req.params.assignmentId);
  const studentId = (req as any).user.id; // from your JWT middleware
  const file = req.file;

  if (!file) return res.status(400).json({ message: "File required" });

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  if (assignment.dueDate && assignment.dueDate < new Date())
    return res.status(400).json({ message: "Deadline passed" });

  const submission = await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    update: {
      filePath: file.path,
      mimeType: file.mimetype,
      status: "PENDING",
      marks: null,
      feedback: null,
      gradedAt: null,
    },
    create: { assignmentId, studentId, filePath: file.path, mimeType: file.mimetype },
  });

  res.status(201).json({ message: "Submitted, grading in progress", submission });

  autoGrade(submission.id); // background
};

// GET /submissions/:id  (student/teacher)
export const getSubmission = async (req: Request, res: Response) => {
  const submissionId = String(req.params.id);
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: { select: { title: true, maxMarks: true } } },
  });
  if (!sub) return res.status(404).json({ message: "Not found" });
  res.json(sub);
};

// POST /submissions/:id/regrade  (teacher)
export const regrade = async (req: Request, res: Response) => {
  const submissionId = String(req.params.id);
  await prisma.submission.update({ where: { id: submissionId }, data: { status: "PENDING" } });
  res.json({ message: "Regrading started" });
  void autoGrade(submissionId);
};

// PATCH /submissions/:id/override  (teacher)
export const overrideMarks = async (req: Request, res: Response) => {
  const submissionId = String(req.params.id);
  const { marks, feedback } = req.body;
  const sub = await prisma.submission.update({
    where: { id: submissionId },
    data: { marks, feedback, status: "GRADED", gradedAt: new Date() },
  });
  res.json(sub);
};
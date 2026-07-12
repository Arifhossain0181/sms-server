import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import * as examService from './exam.service';
import { sendSuccess } from '../../utils/response.util';

const asParamString = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
};

const asOptionalQueryString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : undefined;
  return undefined;
};

// ── Staff: Exam Controller / School Admin ──────────────────────────

export const createExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.createExam(req.body);
    sendSuccess(res, data, 'Exam created', 201);
  } catch (err) { next(err); }
};

/**so this
 * must never be reachable by STUDENT/PARENT roles (enforced in the route). */
export const getAllExams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classId = asOptionalQueryString(req.query.classId);
    const data = await examService.getAllExams(classId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

/** Staff-only detail — same reasoning as getAllExams. */
export const getExamById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getExamById(asParamString(req.params.id));
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.updateExam(asParamString(req.params.id), req.body);
    sendSuccess(res, data, 'Exam updated');
  } catch (err) { next(err); }
};

export const deleteExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await examService.deleteExam(asParamString(req.params.id));
    sendSuccess(res, null, 'Exam deleted');
  } catch (err) { next(err); }
};

export const publishExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // FIX: service now requires actorUserId for the audit log.
    const data = await examService.publishExam(asParamString(req.params.id), req.user!.id);
    sendSuccess(res, data, 'Exam published');
  } catch (err) { next(err); }
};

export const unpublishExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.unpublishExam(asParamString(req.params.id), req.user!.id);
    sendSuccess(res, data, 'Exam unpublished');
  } catch (err) { next(err); }
};

export const createSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.createExamSchedule(req.body);
    sendSuccess(res, data, 'Schedule created', 201);
  } catch (err) { next(err); }
};

export const getScheduleByExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getScheduleByExam(asParamString(req.params.examId));
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const deleteSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await examService.deleteSchedule(asParamString(req.params.id));
    sendSuccess(res, null, 'Schedule deleted');
  } catch (err) { next(err); }
};

// ── Teacher: marks entry ────────────────────────────────────────────

export const submitExamMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = req.user;
    if (!authUser) throw { status: 401, message: 'Unauthorized' };

    const data = await examService.submitExamMarks(asParamString(req.params.examId), req.body, authUser);
    sendSuccess(res, data, 'Marks submitted');
  } catch (err) { next(err); }
};

export const getFailedStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getFailedStudents(
      asParamString(req.params.examId),
      asOptionalQueryString(req.query.classId)
    );
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

// ── Student: own class schedule + own published results ────────────

export const getMyExamSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.user!.id },
      select: { classId: true },
    });
    if (!student) throw { status: 404, message: 'Student profile not found' };

    const data = await examService.getExamScheduleForClass(student.classId);
    sendSuccess(res, data, 'Exam schedule fetched');
  } catch (err) { next(err); }
};

export const getMyResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.user!.id },
      select: { id: true },
    });
    if (!student) throw { status: 404, message: 'Student profile not found' };

    const examId = asOptionalQueryString(req.query.examId);
    const data = await examService.getPublishedResultsForStudent(student.id, examId);
    sendSuccess(res, data, 'Your results fetched');
  } catch (err) { next(err); }
};

// ── Parent: a linked child's schedule + results only ────────────────

async function resolveOwnedChild(userId: string, studentId: string) {
  const parent = await prisma.parent.findFirst({ where: { userId }, select: { id: true } });
  if (!parent) throw { status: 404, message: 'Parent profile not found' };

  const child = await prisma.student.findFirst({
    where: { id: studentId, parentId: parent.id },
    select: { id: true, classId: true },
  });
  if (!child) throw { status: 403, message: 'This student is not linked to your account' };
  return child;
}

export const getChildExamSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const child = await resolveOwnedChild(req.user!.id, asParamString(req.params.studentId));
    const data = await examService.getExamScheduleForClass(child.classId);
    sendSuccess(res, data, "Child's exam schedule fetched");
  } catch (err) { next(err); }
};

export const getChildResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const child = await resolveOwnedChild(req.user!.id, asParamString(req.params.studentId));
    const examId = asOptionalQueryString(req.query.examId);
    const data = await examService.getPublishedResultsForStudent(child.id, examId);
    sendSuccess(res, data, "Child's results fetched");
  } catch (err) { next(err); }
};
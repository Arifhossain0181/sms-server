import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import * as resultService from './result.service.js';
import { sendSuccess } from '../../utils/response.util';

const toSingleString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : undefined;
  if (value === undefined || value === null) return undefined;
  return String(value);
};

// ── Teacher / Staff: submit & review 
export const submitResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = (req as any).user as { id: string; role: string } | undefined;
    if (!authUser) throw { status: 401, message: 'Unauthorized' };
    const examId = req.body.examId || toSingleString(req.query.examId);
    const { studentId, marks } = req.body;
    const data = await resultService.submitResult({ examId, studentId, marks }, authUser);
    sendSuccess(res, data, 'Result submitted', 201);
  } catch (err) { next(err); }
};

export const submitBulkResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = (req as any).user as { id: string; role: string } | undefined;
    if (!authUser) throw { status: 401, message: 'Unauthorized' };

    if (!Array.isArray(req.body)) {
      throw { status: 400, message: 'Request body must be an array of result entries' };
    }
    if (req.body.length === 0) {
      throw { status: 400, message: 'Please enter marks for at least one student' };
    }

    for (let i = 0; i < req.body.length; i++) {
      const entry = req.body[i];
      if (!entry.examId) throw { status: 400, message: `Student ${i + 1}: examId is missing` };
      if (!entry.studentId) throw { status: 400, message: `Student ${i + 1}: studentId is missing` };
      if (!Array.isArray(entry.marks)) throw { status: 400, message: `Student ${i + 1}: marks must be an array` };
      if (entry.marks.length === 0) throw { status: 400, message: `Student ${i + 1}: no marks provided` };
      for (let j = 0; j < entry.marks.length; j++) {
        const mark = entry.marks[j];
        if (!mark.subjectId) throw { status: 400, message: `Student ${i + 1}, Subject ${j + 1}: subjectId is missing` };
        if (typeof mark.marksObtained !== 'number' || mark.marksObtained < 0) {
          throw { status: 400, message: `Student ${i + 1}, Subject ${j + 1}: marks must be a non-negative number` };
        }
      }
    }

    const data = await resultService.submitBulkResult(req.body, authUser);
    sendSuccess(res, data, 'Results submitted', 201);
  } catch (err) { next(err); }
};

/** Staff-only — lookup any student's result by id (roster review, corrections). */
export const getResultByStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const examId = toSingleString(req.query.examId);
    const studentId = toSingleString(req.params.studentId);
    if (!studentId) throw { status: 400, message: 'studentId is required' };
    const data = await resultService.getResultByStudent(studentId, examId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

/** Staff-only — full unfiltered class result list, used for pre-publish review. */
export const getResultByExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const examId = toSingleString(req.params.examId);
    if (!examId) throw { status: 400, message: 'examId is required' };
    const data = await resultService.getResultByExam(examId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateMark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toSingleString(req.params.id);
    if (!id) throw { status: 400, message: 'id is required' };
    // FIX: service now accepts actorUserId for the audit log — was missing.
    const data = await resultService.updateMark(id, req.body, req.user?.id);
    sendSuccess(res, data, 'Mark updated');
  } catch (err) { next(err); }
};

export const getFailedStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const examId = toSingleString(req.params.examId);
    if (!examId) throw { status: 400, message: 'examId is required' };
    const data = await resultService.getFailedStudents(examId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

// ── Student: own (published-only) results 

export const getMyResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.user!.id },
      select: { id: true },
    });
    if (!student) throw { status: 404, message: 'Student profile not found' };

    const examId = toSingleString(req.query.examId);
    const data = await resultService.getResultByStudent(student.id, examId);
    sendSuccess(res, data, 'Your results fetched');
  } catch (err) { next(err); }
};

// ── Parent: a linked child's (published-only) results 

export const getChildResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parent = await prisma.parent.findFirst({ where: { userId: req.user!.id }, select: { id: true } });
    if (!parent) throw { status: 404, message: 'Parent profile not found' };

    const studentId = toSingleString(req.params.studentId);
    const child = await prisma.student.findFirst({
      where: { id: studentId, parentId: parent.id },
      select: { id: true },
    });
    if (!child) throw { status: 403, message: 'This student is not linked to your account' };

    const examId = toSingleString(req.query.examId);
    const data = await resultService.getResultByStudent(child.id, examId);
    sendSuccess(res, data, "Child's results fetched");
  } catch (err) { next(err); }
};
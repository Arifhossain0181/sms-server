import { Request, Response, NextFunction } from 'express';
import * as resultService from './result.service.js';
import { sendSuccess } from '../../utils/response.util';
import { SubmitResultDto } from './result.dto.js';

const toSingleString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : undefined;
  if (value === undefined || value === null) return undefined;
  return String(value);
};

export const submitResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = (req as any).user as { id: string; role: string } | undefined;
    if (!authUser) throw { status: 401, message: 'Unauthorized' };
    // examId can come from body or query params
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

    // Validate each entry
    for (let i = 0; i < req.body.length; i++) {
      const entry = req.body[i];
      if (!entry.examId) {
        throw { status: 400, message: `Student ${i + 1}: examId is missing` };
      }
      if (!entry.studentId) {
        throw { status: 400, message: `Student ${i + 1}: studentId is missing` };
      }
      if (!Array.isArray(entry.marks)) {
        throw { status: 400, message: `Student ${i + 1}: marks must be an array` };
      }
      if (entry.marks.length === 0) {
        throw { status: 400, message: `Student ${i + 1}: no marks provided` };
      }
      // Validate each mark entry
      for (let j = 0; j < entry.marks.length; j++) {
        const mark = entry.marks[j];
        if (!mark.subjectId) {
          throw { status: 400, message: `Student ${i + 1}, Subject ${j + 1}: subjectId is missing` };
        }
        if (typeof mark.marksObtained !== 'number' || mark.marksObtained < 0) {
          throw { status: 400, message: `Student ${i + 1}, Subject ${j + 1}: marks must be a non-negative number` };
        }
      }
    }
    
    const data = await resultService.submitBulkResult(req.body, authUser);
    sendSuccess(res, data, 'Results submitted', 201);
  } catch (err) { next(err); }
};

export const getResultByStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const examId = toSingleString(req.query.examId);
    const studentId = toSingleString(req.params.studentId);
    if (!studentId) throw { status: 400, message: 'studentId is required' };
    const data = await resultService.getResultByStudent(studentId, examId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

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
    const data = await resultService.updateMark(id, req.body);
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
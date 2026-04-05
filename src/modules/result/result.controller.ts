import { Request, Response, NextFunction } from 'express';
import * as resultService from './result.service.js';
import { sendSuccess } from '../../utils/response.util';

const toSingleString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : undefined;
  if (value === undefined || value === null) return undefined;
  return String(value);
};

export const submitResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.submitResult(req.body);
    sendSuccess(res, data, 'Result submitted', 201);
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
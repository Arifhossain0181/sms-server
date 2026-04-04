import { Request, Response, NextFunction } from 'express';
import * as resultService from './result.service';
import { sendSuccess } from '../../utils/response.util';

export const submitResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.submitResult(req.body);
    sendSuccess(res, data, 'Result submitted', 201);
  } catch (err) { next(err); }
};

export const getResultByStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const examId = req.query.examId as string | undefined;
    const data = await resultService.getResultByStudent(req.params.studentId, examId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getResultByExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getResultByExam(req.params.examId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateMark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.updateMark(req.params.id, req.body);
    sendSuccess(res, data, 'Mark updated');
  } catch (err) { next(err); }
};

export const getFailedStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getFailedStudents(req.params.examId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};
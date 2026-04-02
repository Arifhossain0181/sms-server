import { Request, Response, NextFunction } from 'express';
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

export const createExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.createExam(req.body);
    sendSuccess(res, data, 'Exam created', 201);
  } catch (err) { next(err); }
};

export const getAllExams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classId = asOptionalQueryString(req.query.classId);
    const data = await examService.getAllExams(classId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

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
    const data = await examService.publishExam(asParamString(req.params.id));
    sendSuccess(res, data, 'Exam published');
  } catch (err) { next(err); }
};

export const unpublishExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.unpublishExam(asParamString(req.params.id));
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

export const submitExamMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw { status: 401, message: 'Unauthorized' };
    }

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
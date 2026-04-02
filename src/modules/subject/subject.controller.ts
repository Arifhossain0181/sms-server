import { Request, Response, NextFunction } from 'express';
import * as subjectService from './subject.service';
import { sendSuccess } from '../../utils/response.util';

export const createSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await subjectService.createSubject(req.body);
    sendSuccess(res, data, 'Subject created', 201);
  } catch (err) { next(err); }
};

export const getAllSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classId = req.query.classId as string | undefined;
    const data = await subjectService.getAllSubjects(classId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getSubjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await subjectService.getSubjectById(String(req.params.id));
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await subjectService.updateSubject(String(req.params.id), req.body);
    sendSuccess(res, data, 'Subject updated');
  } catch (err) { next(err); }
};

export const deleteSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await subjectService.deleteSubject(String(req.params.id));
    sendSuccess(res, null, 'Subject deleted');
  } catch (err) { next(err); }
};

export const assignTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body?.teacherId) {
      throw { status: 400, message: 'teacherId is required' };
    }
    const data = await subjectService.assignTeacher(String(req.params.id), String(req.body.teacherId));
    sendSuccess(res, data, 'Teacher assigned');
  } catch (err) { next(err); }
};
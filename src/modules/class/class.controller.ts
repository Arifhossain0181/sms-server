import { Request, Response, NextFunction } from 'express';
import * as classService from './class.service';
import { sendSuccess } from '../../utils/response.util';

const asParamString = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
};

// ─── Class ───────────────────────────────────────────

export const createClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.createClass(req.body);
    sendSuccess(res, data, 'Class created', 201);
  } catch (err) { next(err); }
};

export const getAllClasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.getAllClasses();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getClassById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.getClassById(asParamString(req.params.id));
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.updateClass(asParamString(req.params.id), req.body);
    sendSuccess(res, data, 'Class updated');
  } catch (err) { next(err); }
};

export const deleteClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await classService.deleteClass(asParamString(req.params.id));
    sendSuccess(res, null, 'Class deleted');
  } catch (err) { next(err); }
};

// ─── Section ─────────────────────────────────────────

export const createSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.createSection(req.body);
    sendSuccess(res, data, 'Section created', 201);
  } catch (err) { next(err); }
};

export const getSectionsByClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.getSectionsByClass(asParamString(req.params.classId));
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.updateSection(asParamString(req.params.id), req.body);
    sendSuccess(res, data, 'Section updated');
  } catch (err) { next(err); }
};

export const deleteSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await classService.deleteSection(asParamString(req.params.id));
    sendSuccess(res, null, 'Section deleted');
  } catch (err) { next(err); }
};
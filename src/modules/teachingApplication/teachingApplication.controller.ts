import { Request, Response, NextFunction } from "express";
import * as teachingApplicationService from "./teachingApplication.service";
import { sendSuccess } from "../../utils/response.util";

export const apply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teachingApplicationService.applyForTeaching(req.body);
    sendSuccess(res, data, "Teaching application submitted", 201);
  } catch (err) {
    next(err);
  }
};

export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teachingApplicationService.listTeachingApplications();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await teachingApplicationService.getTeachingApplicationById(id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await teachingApplicationService.updateTeachingApplicationStatus(id, req.body);
    sendSuccess(res, data, "Teaching application updated");
  } catch (err) {
    next(err);
  }
};

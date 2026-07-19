import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  logger.error(`[ERROR] ${req.method} ${req.path} -> ${status} ${message}`, err);
  res.status(status).json({ success: false, message });
};
import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from '../config/config';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const status = err.message.includes('limit') ? STATUS_CODES.BAD_REQUEST : STATUS_CODES.INTERNAL_SERVER_ERROR;
  res.status(status).json({ error: err.message });
}

export default errorHandler;

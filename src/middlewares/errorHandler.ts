import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const status = err.message.includes('limit') ? 400 : 500;
  res.status(status).json({ error: err.message });
}

export default errorHandler;

import { Request, Response, NextFunction } from 'express';
import { getTenantByApiKey } from '../services/tenantService';
import { AppError } from '../utils/errors';
import { STATUS_CODES } from '../config/config';

export async function authenticateTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      throw new AppError('API key is missing', STATUS_CODES.UNAUTHORIZED);
    }

    const tenant = await getTenantByApiKey(apiKey);
    if (!tenant) {
      throw new AppError('Invalid API key', STATUS_CODES.UNAUTHORIZED);
    }
    next();
  } catch (error) {
    handleError(res, error);
  }
}

// Unified error handler for the middleware
function handleError(res: Response, error: any) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
  } else {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
}

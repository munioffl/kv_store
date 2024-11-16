import { Request, Response } from 'express';
import Joi from 'joi';
import { STATUS_CODES } from '../config/config';
import { createTenant } from '../services/tenantService';
import { handleError } from './objectController';
import { AppError } from '../utils/errors';

const tenantSchema = Joi.object({
  name: Joi.string().required(),
  tenantLimitMb: Joi.number().required(),
  rateLimit: Joi.number().required(),
});

export async function createTenantController(req: Request, res: Response) {
  try {
    const { name, tenantLimitMb, rateLimit } = req.body;
    const { error } = tenantSchema.validate({ name, tenantLimitMb, rateLimit });
    if (error) {
      throw new AppError(error.details[0].message, STATUS_CODES.BAD_REQUEST);
    }
    const { message, apiKey } = await createTenant(name as string, tenantLimitMb, rateLimit);
    res.status(STATUS_CODES.CREATED).json({ message, apiKey });
  } catch (error) {
    handleError(res, error);
  }
}

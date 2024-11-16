import { Request, Response } from 'express';
import Joi from 'joi';
import { createObject, getObject, deleteObject, createObjectsBatch } from '../services/objectService';
import { STATUS_CODES } from '../config/config';
import { AppError } from '../utils/errors';
import { getTenantByApiKey } from '../services/tenantService';
import { TenantModel } from '../models/tenantModel';

const validateTenant = async (apiKey: string): Promise<TenantModel> => {
  const tenant = await getTenantByApiKey(apiKey);
  if (!tenant) {
    throw new AppError('Invalid API key', STATUS_CODES.UNAUTHORIZED);
  }
  return tenant;
};

const objectSchema = Joi.object({
  key: Joi.string().required(),
  data: Joi.object().required(),
  ttl: Joi.number().optional().greater(Date.now() / 1000),
});

const objectsBatchSchema = Joi.array().items(
  Joi.object({
    key: Joi.string().required(),
    data: Joi.object().required(),
    ttl: Joi.number().optional().greater(Date.now() / 1000),
  })
);

export async function getObjectController(req: Request, res: Response) {
  try {
    const { key } = req.params;
    const apiKey = req.headers['x-api-key'] as string;
    const tenant = await validateTenant(apiKey);
    const data = await getObject(key, tenant.tenantId);
    res.status(STATUS_CODES.OK).json({ key, data });
  } catch (error) {
    handleError(res, error);
  }
}

export async function createObjectController(req: Request, res: Response) {
  try {
    const { key, data, ttl } = req.body;

    // Validate request body using Joi
    const { error } = objectSchema.validate({ key, data, ttl });
    if (error) {
      throw new AppError(error.details[0].message, STATUS_CODES.BAD_REQUEST);
    }

    const apiKey = req.headers['x-api-key'] as string;
    const tenant = await validateTenant(apiKey);
    const response = await createObject(key, data, tenant.tenantId, ttl);
    res.status(STATUS_CODES.CREATED).json({ message: 'Object created', response });
  } catch (error) {
    handleError(res, error);
  }
}

export async function deleteObjectController(req: Request, res: Response) {
  try {
    const { key } = req.params;
    const apiKey = req.headers['x-api-key'] as string;
    const tenant = await validateTenant(apiKey);
    const result = await deleteObject(key, tenant.tenantId);
    res.status(STATUS_CODES.OK).json({ message: result });
  } catch (error) {
    handleError(res, error);
  }
}

export async function createObjectsBatchController(req: Request, res: Response) {
  try {
    const objects = req.body;

    // Validate request body using Joi
    const { error } = objectsBatchSchema.validate(objects);
    if (error) {
      throw new AppError(error.details[0].message, STATUS_CODES.BAD_REQUEST);
    }

    const apiKey = req.headers['x-api-key'] as string;
    const tenant = await validateTenant(apiKey);
    const response = await createObjectsBatch(objects, tenant.tenantId);
    res.status(STATUS_CODES.CREATED).json({ message: 'Objects created', response });
  } catch (error) {
    handleError(res, error);
  }
}

export const handleError = (res: Response, error: any) => {
  const statusCode = error instanceof AppError ? error.statusCode : STATUS_CODES.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({ error: error.message || 'Internal Server Error' });
};

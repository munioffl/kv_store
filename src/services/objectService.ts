import { KVModel } from '../models/kvModel';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';


const BATCH_LIMIT = 50;

export async function createObject(key: string, data: object, tenantId: string, ttl?: number) {
  const existingRecord = await KVModel.findOne({ where: { key } });
  if (existingRecord) {
    throw new ConflictError('Key already exists in the database');
  }
  try {
    const response = await KVModel.create({ key, data, ttl, tenantId });
    return response;
  } catch (error) {
    throw new ValidationError('Error while creating object');
  }
}

export async function getObject(key: string, tenantId: string) {
  const record = await KVModel.findOne({ where: { key , tenantId} });
  if (!record) {
    throw new NotFoundError('Key not found in database');
  }
  return record;
}

export async function deleteObject(key: string, tenantId: string) {
  const deletedCount = await KVModel.destroy({ where: { key , tenantId} });
  if (!deletedCount) {
    throw new NotFoundError('Key not found in database');
  }
  return 'Key deleted successfully';
}

export async function createObjectsBatch(objects: { key: string; data: object; ttl?: number }[], tenantId: string) {
  if (objects.length > BATCH_LIMIT) {
    throw new ValidationError(`Batch limit of ${BATCH_LIMIT} exceeded`);
  }

  const duplicateKeys: string[] = [];
  const createdRecords: string[] = [];

  for (const obj of objects) { 
    const existingRecord = await KVModel.findOne({ where: { key: obj.key } });
    if (existingRecord) {
      duplicateKeys.push(obj.key);
      continue;
    }

    try {
      createdRecords.push(obj.key);
      await KVModel.create({ key: obj.key, data: obj.data, ttl: obj.ttl, tenantId });
    } catch (error) {
      throw new ValidationError(`Error while processing key: ${obj.key}`);
    }
  }

  if (duplicateKeys.length > 0) {
    throw new ConflictError(`Some keys already exist in the database: ${duplicateKeys.join(', ')}`);
  }

  return {
    message: 'All keys were successfully created',
    created: createdRecords,
  };
}

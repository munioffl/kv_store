import { KVModel } from '../models/kvModel';
import { redisClient } from '../cache/redisClient';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const TENANT_LIMIT_MB = 1 * 1024 * 1024; // 1 MB limit per tenant
const BATCH_LIMIT = 50;

export async function validateTenantLimit(tenantId: string, newDataSize: number) {
  const records = await KVModel.findAll({ where: { tenantId } });
  const totalSize = records.reduce((accum, record) => accum + Buffer.byteLength(JSON.stringify(record.data)), 0);
  if (totalSize + newDataSize > TENANT_LIMIT_MB) {
    logger.error('Tenant limit exceeded');
    return false;
  }
  return true;
}


export async function getTenantIdForKey(dataSize: any) {
  const existingRecords = await KVModel.findAll({
    order: [['createdAt', 'DESC']],
    limit: 1,
  });
  if (existingRecords && existingRecords.length > 0) {
    const limit_available= await validateTenantLimit(existingRecords[0].tenantId, dataSize);
    if(limit_available){
      return existingRecords[0].tenantId; 
    }
    else{
      return uuidv4();
    }

  } else {
    return uuidv4();
}}

export async function createObject(key: string, data: object, ttl?: number) {
  await KVModel.sync({ alter: true });  
  const dataSize = Buffer.byteLength(JSON.stringify(data));
  try {

    const tenantId = await getTenantIdForKey(dataSize);
    
    const existingRecord = await KVModel.findOne({ where: { key } });
    if (existingRecord) {
      logger.info('Key already exists in the database');
      return 'Key already exists in the database';
    }
    const response = await KVModel.create({ key, data, ttl, tenantId });
    if (ttl) {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    }
    return response;
  } catch (error) {
    logger.error('Error creating object:', error);
    throw error;
  }
}


export async function getObject(key: string) {
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    logger.info('Data found in Redis cache');
    return JSON.parse(cachedData);
  }
  const record = await KVModel.findOne({ where: { key } });
  if (!record) logger.error('Key not found in database');

  if (record && record.ttl) {
    logger.info('Data found in database and stored in Redis cache');
    await redisClient.setEx(key, record.ttl, JSON.stringify(record));
  }
  return record ? record : 'Key not found in database';
}

export async function deleteObject(key: string) {
  const deletedCount = await KVModel.destroy({ where: { key } });

  if(deletedCount){
    await redisClient.del(key);
    return 'Key deleted successfully';
  }
  return 'Key not found in database';
}

export async function createObjectsBatch(objects: { key: string, data: object, ttl?: number }[]) {
  if (objects.length > BATCH_LIMIT) throw new Error(`Batch limit of ${BATCH_LIMIT} exceeded`);
  const duplicateKeys = [];
  const createdRecords = []

  for (const obj of objects) {
    const dataSize = Buffer.byteLength(JSON.stringify(obj.data));
    const tenantId = await getTenantIdForKey(dataSize);
    const existingRecord = await KVModel.findOne({ where: { key: obj.key } });
    if (existingRecord) {
      logger.info('Key already exists in the database', obj.key);
      duplicateKeys.push(obj.key);
      continue;
    }
    createdRecords.push(obj.key);
    await KVModel.create({ key: obj.key, data: obj.data, ttl: obj.ttl, tenantId: tenantId });
    if (obj.ttl) {
      await redisClient.setEx(obj.key, obj.ttl, JSON.stringify(obj.data));
    }
  }
  return {
    message: duplicateKeys.length > 0 
      ? 'Some keys were not created because they already exist in the database' 
      : 'All keys were successfully created',
    duplicates: duplicateKeys,  
    created: createdRecords      
  };
}

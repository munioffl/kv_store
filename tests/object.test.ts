import request from 'supertest';
import express from 'express';
import { KVModel } from '../src/models/kvModel';
import { redisClient } from '../src/cache/redisClient';
import objectController from '../src/controllers/objectController';
import { createObject, createObjectsBatch, deleteObject, getObject, getTenantIdForKey } from '../src/services/objectService';

jest.mock('../src/models/kvModel');
jest.mock('../src/cache/redisClient');
jest.mock('../src/services/objectService', () => ({
  ...jest.requireActual('../src/services/objectService'),
  getTenantIdForKey: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/objects', objectController); 

describe('getObject', () => {
    it('should retrieve an object from the database if not in cache', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      (KVModel.findOne as jest.Mock).mockResolvedValue({ key: 'key1', data: { name: 'John' }, ttl: 60 });

      const response = await getObject('key1');
      expect(redisClient.get).toHaveBeenCalledWith('key1');
      expect(KVModel.findOne).toHaveBeenCalledWith({ where: { key: 'key1' } });
      expect(response).toHaveProperty('data', { name: 'John' });
    });

    it('should retrieve an object from Redis cache if available', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify({ name: 'John' }));

      const response = await getObject('key1');
      expect(redisClient.get).toHaveBeenCalledWith('key1');
      expect(response).toEqual({ name: 'John' });
    });

    it('should return error if key is not found', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      (KVModel.findOne as jest.Mock).mockResolvedValue(null);

      const response = await getObject('key1');
      expect(response).toBe('Key not found in database');
    });
});

describe('deleteObject', () => {
    it('should delete an object if it exists in the database', async () => {
      (KVModel.destroy as jest.Mock).mockResolvedValue(1);

      const response = await deleteObject('key1');
      expect(KVModel.destroy).toHaveBeenCalledWith({ where: { key: 'key1' } });
      expect(redisClient.del).toHaveBeenCalledWith('key1');
      expect(response).toBe('Key deleted successfully');
    });

    it('should return an error if the key does not exist', async () => {
      (KVModel.destroy as jest.Mock).mockResolvedValue(0);

      const response = await deleteObject('key1');
      expect(response).toBe('Key not found in database');
    });
});

describe('createObject', () => {
    const mockKey = 'existingKey';
    const mockData = { name: 'Existing Object' };
    const mockTTL = 60;
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return a message when the key already exists', async () => {
      (KVModel.findOne as jest.Mock).mockResolvedValue({ key: mockKey });
      const result = await createObject(mockKey, mockData, mockTTL);
      expect(result).toBe('Key already exists in the database');
      expect(KVModel.findOne).toHaveBeenCalledWith({ where: { key: mockKey } });
      expect(KVModel.create).not.toHaveBeenCalled();
      expect(redisClient.setEx).not.toHaveBeenCalled();
    });
});

describe('createObjectsBatch', () => {
    const mockObjects = [
      { key: 'key1', data: { name: 'Object 1' }, ttl: 60 },
      { key: 'key2', data: { name: 'Object 2' }, ttl: 60 },
    ];
    const mockTenantId = 'tenant-1';
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return a success message with created keys and handle duplicates', async () => {
      (getTenantIdForKey as jest.Mock).mockResolvedValue(mockTenantId);
      (KVModel.findOne as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ key: 'key2' });

      (KVModel.create as jest.Mock).mockResolvedValue({
        key: 'key1',
        data: { name: 'Object 1' },
        ttl: 60,
        tenantId: mockTenantId,
      });

      (redisClient.setEx as jest.Mock).mockResolvedValue(true);

      const result = await createObjectsBatch(mockObjects);

      expect(KVModel.findOne).toHaveBeenCalledTimes(2);
      expect(KVModel.findOne).toHaveBeenCalledWith({ where: { key: 'key1' } });
      expect(KVModel.findOne).toHaveBeenCalledWith({ where: { key: 'key2' } });

      expect(KVModel.create).toHaveBeenCalledWith({
        key: 'key1',
        data: { name: 'Object 1' },
        ttl: 60,
        tenantId: expect.any(String),
      });

      expect(redisClient.setEx).toHaveBeenCalledWith('key1', 60, JSON.stringify({ name: 'Object 1' }));
      expect(redisClient.setEx).not.toHaveBeenCalledWith('key2');

      expect(result).toEqual({
        message: 'Some keys were not created because they already exist in the database',
        duplicates: ['key2'],
        created: ['key1'],
      });
    });
});

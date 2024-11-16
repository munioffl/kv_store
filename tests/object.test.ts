import { KVModel } from '../src/models/kvModel';
import { createObject, getObject, deleteObject, createObjectsBatch } from '../src/services/objectService';
import { ConflictError, NotFoundError, ValidationError } from '../src//utils/errors';

jest.mock('../src/models/kvModel');

describe('objectService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createObject', () => {
    it('should create a new object successfully', async () => {
      (KVModel.findOne as jest.Mock).mockResolvedValue(null);
      (KVModel.create as jest.Mock).mockResolvedValue({ key: 'test-key', data: { test: 'data' } });

      const response = await createObject('test-key', { test: 'data' }, 'tenant-123', 3600);

      expect(response).toEqual(expect.objectContaining({ key: 'test-key' }));
      expect(KVModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictError if the key already exists', async () => {
      (KVModel.findOne as jest.Mock).mockResolvedValue({ key: 'test-key' });

      await expect(createObject('test-key', { test: 'data' }, 'tenant-123')).rejects.toThrow(ConflictError);
    });
  });

  describe('getObject', () => {
    it('should retrieve an object successfully', async () => {
      (KVModel.findOne as jest.Mock).mockResolvedValue({ key: 'test-key', data: { test: 'data' } });

      const response = await getObject('test-key', 'tenant-123');

      expect(response).toEqual(expect.objectContaining({ key: 'test-key' }));
      expect(KVModel.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundError if the key does not exist', async () => {
      (KVModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(getObject('test-key', 'tenant-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteObject', () => {
    it('should delete an object successfully', async () => {
      (KVModel.destroy as jest.Mock).mockResolvedValue(1);

      const response = await deleteObject('test-key', 'tenant-123');

      expect(response).toBe('Key deleted successfully');
      expect(KVModel.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundError if the key does not exist', async () => {
      (KVModel.destroy as jest.Mock).mockResolvedValue(0);

      await expect(deleteObject('test-key', 'tenant-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createObjectsBatch', () => {
    it('should create objects in batch successfully', async () => {
      (KVModel.findOne as jest.Mock).mockResolvedValue(null);
      (KVModel.create as jest.Mock).mockResolvedValue({});

      const response = await createObjectsBatch(
        [
          { key: 'key1', data: { test: 'data1' } },
          { key: 'key2', data: { test: 'data2' } },
        ],
        'tenant-123'
      );

      expect(response.message).toBe('All keys were successfully created');
      expect(response.created).toEqual(['key1', 'key2']);
    });

    it('should throw ValidationError if batch limit is exceeded', async () => {
      const objects = new Array(51).fill({ key: 'key', data: {} });

      await expect(createObjectsBatch(objects, 'tenant-123')).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError for duplicate keys', async () => {
      (KVModel.findOne as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ key: 'key2' });

      await expect(
        createObjectsBatch(
          [
            { key: 'key1', data: { test: 'data1' } },
            { key: 'key2', data: { test: 'data2' } },
          ],
          'tenant-123'
        )
      ).rejects.toThrow(ConflictError);
    });
  });
});

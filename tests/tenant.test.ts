import { createTenant, getTenantByApiKey } from '../src/services/tenantService';
import { TenantModel } from '../src/models/tenantModel';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

jest.mock('../src/models/tenantModel');
jest.mock('bcrypt');
jest.mock('uuid');
jest.mock('crypto');

describe('Tenant Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTenant', () => {
    it('should create a new tenant and return the tenant and API key', async () => {
      const name = 'Test Tenant';
      const tenantLimitMb = 10;
      const rateLimit = 200;
      const tenantId = '12345';
      const apiKey = 'test-api-key';
      const hashedApiKey = 'hashed-api-key';

      (uuidv4 as jest.Mock).mockReturnValue(tenantId);
      (crypto.randomBytes as jest.Mock).mockReturnValue({ toString: () => apiKey });
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedApiKey);
      (TenantModel.create as jest.Mock).mockResolvedValue({
        tenantId,
        name,
        apiKey: hashedApiKey,
        tenantLimit: tenantLimitMb * 1024 * 1024,
        rateLimit,
      });

      const result = await createTenant(name, tenantLimitMb, rateLimit);

      expect(uuidv4).toHaveBeenCalled();
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(bcrypt.hash).toHaveBeenCalledWith(apiKey, 10);
      expect(TenantModel.create).toHaveBeenCalledWith({
        tenantId,
        name,
        apiKey: hashedApiKey,
        tenantLimit: tenantLimitMb * 1024 * 1024,
        rateLimit,
      });
      expect(result).toEqual({
        message: 'Tenant successfully created.',
        apiKey,
      });
    });

    it('should return an error if the tenant already exists', async () => {
      const name = 'Existing Tenant';
      const tenantLimitMb = 10;
      const rateLimit = 200;

      (TenantModel.findOne as jest.Mock).mockResolvedValue({ name });

      const result = await createTenant(name, tenantLimitMb, rateLimit);

      expect(result).toEqual({
        message: 'Tenant already exists.',
        apiKey: 'API key cannot be retrieved',
      });
      expect(TenantModel.findOne).toHaveBeenCalledWith({ where: { name } });
    });
  });

  describe('getTenantByApiKey', () => {
    it('should return the tenant if the API key matches', async () => {
      const apiKey = 'test-api-key';
      const hashedApiKey = 'hashed-api-key';
      const tenant = {
        tenantId: '12345',
        name: 'Test Tenant',
        apiKey: hashedApiKey,
        tenantLimit: 10 * 1024 * 1024,
        rateLimit: 200,
      };

      (TenantModel.findAll as jest.Mock).mockResolvedValue([tenant]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await getTenantByApiKey(apiKey);

      expect(TenantModel.findAll).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(apiKey, hashedApiKey);
      expect(result).toEqual(tenant);
    });

    it('should return null if the API key does not match', async () => {
      const apiKey = 'test-api-key';
      const hashedApiKey = 'hashed-api-key';
      const tenant = {
        tenantId: '12345',
        name: 'Test Tenant',
        apiKey: hashedApiKey,
        tenantLimit: 10 * 1024 * 1024,
        rateLimit: 200,
      };

      (TenantModel.findAll as jest.Mock).mockResolvedValue([tenant]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await getTenantByApiKey(apiKey);

      expect(TenantModel.findAll).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(apiKey, hashedApiKey);
      expect(result).toBeNull();
    });
  });
});
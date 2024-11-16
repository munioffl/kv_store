import { KVModel } from '../models/kvModel';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { TenantModel } from '../models/tenantModel';
import crypto from 'crypto';

const DEFAULT_TENANT_LIMIT_MB = 1 * 1024 * 1024; // Default limit in bytes


export async function createTenant(
  name: string,
  tenantLimitMb: number = DEFAULT_TENANT_LIMIT_MB,
  rateLimit: number = 100
): Promise<{ message: string; apiKey: string }> {
  const existingTenant = await TenantModel.findOne({ where: { name } });

  if (existingTenant) {
    logger.info('Tenant already exists');
    return { message: 'Tenant already exists.', apiKey: 'API key cannot be retrieved' };
  }

  const newTenantId = uuidv4();
  const apiKey = crypto.randomBytes(32).toString('hex');
  const hashedApiKey = await bcrypt.hash(apiKey, 10);

  await TenantModel.create({
    tenantId: newTenantId,
    name,
    apiKey: hashedApiKey,
    tenantLimit: tenantLimitMb * 1024 * 1024, // Convert to bytes
    rateLimit,
  });

  return { message: 'Tenant successfully created.', apiKey };
}

export async function getTenantByApiKey(apiKey: string): Promise<TenantModel | null> {
  const tenants = await TenantModel.findAll();
  for (const tenant of tenants) {
    const isMatch = await bcrypt.compare(apiKey, tenant.apiKey);
    if (isMatch) {
      return tenant;
    }
  }
  return null;
}

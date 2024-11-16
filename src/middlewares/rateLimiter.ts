import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { getTenantByApiKey } from '../services/tenantService';

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: async (req: Request) => {
    const apiKey = req.headers['x-api-key'] as string;
    const tenant = await getTenantByApiKey(apiKey);
    return tenant ? tenant.rateLimit : 100; // Default to 100 if tenant not found
  },
  keyGenerator: (req: Request) => {
    const tenantId = req.headers['tenant-id'] as string;
    return tenantId || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
});

export default rateLimiter;
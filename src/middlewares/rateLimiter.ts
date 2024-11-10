import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each tenant to 100 requests per window
  message: 'Too many requests, please try again later.',
});

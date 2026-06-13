import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7', // combined RateLimit-Limit, RateLimit-Remaining, and RateLimit-Reset headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests. Please wait a minute before trying again.',
  },
});

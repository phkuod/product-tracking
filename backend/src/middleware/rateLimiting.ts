import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { ApiResponse } from '../types/index.js';

// General rate limiting
export const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests in development
  skip: (req) => config.isDevelopment && req.method === 'GET'
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful auth attempts
});

// API rate limiting for data modification
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    message: 'API rate limit exceeded, please slow down',
    code: 'API_RATE_LIMIT_EXCEEDED'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  // Only apply to POST, PUT, DELETE methods
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
});
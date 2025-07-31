import { Request, Response, NextFunction } from 'express';
import { logApiRequest } from '../utils/logger.js';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    const responseTime = Date.now() - startTime;
    logApiRequest(req, res, responseTime);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

// Request ID middleware for tracing
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.get('X-Request-ID') || generateRequestId();
  
  // Add request ID to request object
  (req as any).requestId = requestId;
  
  // Add request ID to response headers
  res.set('X-Request-ID', requestId);
  
  next();
};

// Simple request ID generator
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
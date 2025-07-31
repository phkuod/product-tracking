import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';
import logger from '../utils/logger.js';
import { config } from '../config/index.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, errors?: string[]) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
    
    if (originalError && config.isDevelopment) {
      this.stack = originalError.stack;
    }
  }
}

// Error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let errors: string[] = [];

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'APP_ERROR';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    // Extract validation errors if available
    if ((error as any).details) {
      errors = (error as any).details.map((detail: any) => detail.message);
    }
  } else if (error.message.includes('UNIQUE constraint failed')) {
    statusCode = 409;    message = 'Resource already exists';
    code = 'DUPLICATE_ERROR';
  } else if (error.message.includes('FOREIGN KEY constraint failed')) {
    statusCode = 400;
    message = 'Invalid reference to related resource';
    code = 'FOREIGN_KEY_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Log error
  logger.error('API Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: req.user?.username || 'anonymous'
  });

  // Prepare error response
  const errorResponse: ApiResponse = {
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined
  };

  // Add additional details in development
  if (config.isDevelopment) {
    errorResponse.stack = error.stack;
    errorResponse.code = code;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global uncaught exception handlers
export const setupGlobalErrorHandlers = () => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack
    });
    // Don't exit in development to avoid interrupting development flow
    if (config.isProduction) {
      process.exit(1);
    }
  });
};

// Helper function to create standard API responses
export const createResponse = <T>(
  data?: T,
  message?: string,
  success: boolean = true
): ApiResponse<T> => {
  const response: ApiResponse<T> = { success };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  return response;
};

// Helper function to send paginated responses
export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
) => {
  const pages = Math.ceil(total / limit);
  
  const response = {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    },
    message
  };

  res.json(response);
};
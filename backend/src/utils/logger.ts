import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for log messages
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      logMessage += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    if (stack) {
      logMessage += `\n${stack}`;
    }
    return logMessage;
  })
);

// Create winston logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'product-tracking-api' },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),

    // Separate file for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add console transport for development
if (config.isDevelopment) {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Helper functions for structured logging
export const logWithContext = (level: string, message: string, context: Record<string, any> = {}) => {
  logger.log(level, message, {
    ...context,
    timestamp: new Date().toISOString()
  });
};

export const logError = (error: Error, context: Record<string, any> = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
};

export const logApiRequest = (req: any, res: any, responseTime: number) => {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    user: req.user?.username || 'anonymous'
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP request failed', logData);
  } else {
    logger.info('HTTP request completed', logData);
  }
};

export const logDatabaseQuery = (query: string, params: any[], duration: number) => {
  if (config.isDevelopment) {
    logger.debug('Database query executed', {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      duration: `${duration}ms`
    });
  }
};

export const logAuthEvent = (event: string, username: string, success: boolean, details?: Record<string, any>) => {
  const logData = {
    event,
    username,
    success,
    ...details
  };

  if (success) {
    logger.info(`Authentication event: ${event}`, logData);
  } else {
    logger.warn(`Authentication failed: ${event}`, logData);
  }
};

export default logger;
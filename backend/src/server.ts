import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'express-async-errors';

import { config } from './config/index.js';
import { db } from './config/database.js';
import logger from './utils/logger.js';
import {
  errorHandler,
  notFoundHandler,
  setupGlobalErrorHandlers,
  requestLogger,
  requestId,
  generalRateLimit
} from './middleware/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import routeRoutes from './routes/routes.js';
import stationRoutes from './routes/stations.js';
// import analyticsRoutes from './routes/analytics.js';
// import userRoutes from './routes/users.js';

class Server {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    
    this.initializeGlobalErrorHandlers();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeGlobalErrorHandlers(): void {
    setupGlobalErrorHandlers();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }));

    // CORS configuration - Allow all origins in development
    this.app.use(cors({
      origin: config.isDevelopment ? true : (origin, callback) => {
        const allowedOrigins = Array.isArray(config.cors.origin) 
          ? config.cors.origin 
          : [config.cors.origin];
        
        console.log(`CORS check - Origin: ${origin}, Allowed: ${allowedOrigins.join(', ')}`);
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          console.log('CORS: Origin allowed');
          callback(null, true);
        } else {
          console.log('CORS: Origin blocked');
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging and tracing
    this.app.use(requestId);
    this.app.use(requestLogger);

    // Rate limiting
    this.app.use(generalRateLimit);

    // Trust proxy for rate limiting and logging
    if (config.isProduction) {
      this.app.set('trust proxy', 1);
    }
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: '1.0.0'
      });
    });

    // API info endpoint
    this.app.get(`${config.apiPrefix}/info`, (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'Product Process Tracking API',
          version: '1.0.0',
          environment: config.nodeEnv,
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            auth: `${config.apiPrefix}/auth`,
            products: `${config.apiPrefix}/products`,
            routes: `${config.apiPrefix}/routes`,
            stations: `${config.apiPrefix}/stations`,
            analytics: `${config.apiPrefix}/analytics`,
            users: `${config.apiPrefix}/users`
          }
        }
      });
    });

    // API routes
    this.app.use(`${config.apiPrefix}/auth`, authRoutes);
    this.app.use(`${config.apiPrefix}/products`, productRoutes);
    this.app.use(`${config.apiPrefix}/routes`, routeRoutes);
    this.app.use(`${config.apiPrefix}/stations`, stationRoutes);
    // this.app.use(`${config.apiPrefix}/analytics`, analyticsRoutes);
    // this.app.use(`${config.apiPrefix}/users`, userRoutes);

    // Temporary test endpoints (remove when real routes are implemented)
    this.app.get(`${config.apiPrefix}/test`, (req, res) => {
      res.json({
        success: true,
        message: 'API test endpoint working',
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler for unmatched routes
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await db.connect();
      logger.info('Database connected successfully');

      // Start server
      this.app.listen(this.port, () => {
        logger.info(`🚀 Server is running on port ${this.port}`);
        logger.info(`🌍 Environment: ${config.nodeEnv}`);
        logger.info(`📊 API Base URL: http://localhost:${this.port}${config.apiPrefix}`);
        logger.info(`🏥 Health Check: http://localhost:${this.port}/health`);
        
        if (config.isDevelopment) {
          logger.info(`🔧 Development mode: Additional logging enabled`);
        }
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      try {
        // Close database connection
        await db.close();
        logger.info('Database connection closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}

// Start server
const server = new Server();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default server;
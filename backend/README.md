# Product Process Tracking API

Backend web service for the Product Process Tracking System built with Node.js, Express.js, TypeScript, and SQLite.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run database migrations
npm run migrate up

# Seed database with initial data
npm run seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:3001`

## 📊 Database

### Setup Database
```bash
# Run migrations
npm run migrate up

# Check migration status
npm run migrate status

# Rollback to specific version
npm run migrate down 1

# Seed initial data
npm run seed
```

### Default Users
After seeding, you can use these credentials:
- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`  
- **Operator**: `operator1` / `operator123`

## 🛠️ Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Database migration tool
- `npm run seed` - Seed database with initial data
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/         # Database models and queries
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic layer
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript type definitions
│   └── scripts/        # Migration and seed scripts
├── data/               # SQLite database files
├── logs/               # Application logs
└── tests/              # Test suites
```

## 🔐 Environment Variables

Key environment variables (see `.env.example`):

- `PORT` - Server port (default: 3001)
- `DATABASE_PATH` - SQLite database file path
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Frontend URL for CORS
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - List products (with filtering)
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/bulk` - Bulk operations

### Routes & Stations
- `GET /api/routes` - List routes
- `POST /api/routes` - Create route
- `GET /api/stations` - List stations
- `POST /api/stations` - Create station

### Analytics
- `GET /api/analytics` - Dashboard analytics
- `GET /api/analytics/stations` - Station utilization
- `GET /api/analytics/owners` - Owner performance

### Health & Info
- `GET /health` - Health check
- `GET /api/info` - API information

## 🔒 Security Features

- JWT authentication with refresh tokens
- Role-based access control
- Request rate limiting
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Security headers with Helmet
- Audit logging

## 📈 Performance

- Database indexing on key columns
- Response compression
- Request/response logging
- Analytics caching
- Connection pooling
- Query optimization

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Logging

Logs are written to:
- `./logs/app.log` - All application logs
- `./logs/error.log` - Error logs only
- Console (development only)

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t product-tracking-api .

# Run container
docker run -p 3001:3001 product-tracking-api
```

## 📚 API Documentation

Interactive API documentation available at:
- Development: `http://localhost:3001/api/docs`
- Swagger/OpenAPI spec: `http://localhost:3001/api/docs.json`

## 🔧 Development

### Adding New Endpoints

1. Define types in `src/types/index.ts`
2. Create controller in `src/controllers/`
3. Add routes in `src/routes/`
4. Add validation middleware
5. Update tests

### Database Changes

1. Create migration in `src/scripts/migrations.ts`
2. Run migration: `npm run migrate up`
3. Update seed data if needed
4. Update TypeScript types

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Set production environment variables
- Configure reverse proxy (nginx)
- Set up SSL certificates
- Configure database backups
- Set up monitoring and logging

## 📞 Support

For issues and questions:
- Check logs in `./logs/`
- Review API documentation
- Check database migrations status
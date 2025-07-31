# API Testing Guide

Complete guide for testing the Product Process Tracking API using multiple approaches.

## 🚀 Quick Start

### 1. Start the Server
```bash
cd backend
npm install
npm run migrate up
npm run seed
npm run dev
```

Server runs on `http://localhost:3001`

## 🧪 Testing Methods

### Method 1: REST Client Files (VS Code)

Use the `.http` files for quick API testing directly in VS Code:

1. **Install REST Client Extension**
   - Install "REST Client" extension in VS Code
   - Open `backend/tests/api-tests.http`

2. **Basic Tests**
   ```http
   # Health check
   GET http://localhost:3001/health
   
   # API info
   GET http://localhost:3001/api/info
   
   # Test endpoint
   GET http://localhost:3001/api/test
   ```

3. **Authentication Flow**
   ```http
   # Login to get token
   POST http://localhost:3001/api/auth/login
   Content-Type: application/json
   
   {
     "username": "admin",
     "password": "admin123"
   }
   
   # Use token for protected endpoints
   GET http://localhost:3001/api/products
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

### Method 2: Automated Tests (Jest + Supertest)

Run comprehensive test suites:

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.ts

# Run tests with coverage
npm test -- --coverage

# Watch mode for development
npm test:watch
```

**Test Files:**
- `tests/auth.test.ts` - Authentication endpoints
- `tests/products.test.ts` - Product CRUD operations
- `tests/health.test.ts` - Health and info endpoints

### Method 3: Postman Collection

Import the comprehensive Postman collection:

1. **Import Collection**
   - Open Postman
   - Import `backend/Product-Tracking-API.postman_collection.json`

2. **Set Variables**
   - `base_url`: `http://localhost:3001`
   - Other variables auto-populate from responses

3. **Authentication**
   - Run "Login" request first
   - JWT token automatically stored for subsequent requests

## 📋 Test Scenarios

### Authentication Tests
- ✅ Valid login credentials
- ❌ Invalid credentials
- ❌ Missing required fields
- ✅ Token refresh
- ❌ Expired/invalid tokens

### Product Management
- ✅ List all products with pagination
- ✅ Filter products by status, search, date range
- ✅ Create new product with validation
- ✅ Update product details
- ✅ Get single product with history
- ✅ Bulk operations (multi-product updates)
- ✅ Advance product through stations
- ❌ Invalid UUID formats
- ❌ Unauthorized access attempts

### Route & Station Management
- ✅ CRUD operations for routes
- ✅ CRUD operations for stations
- ✅ Station field configuration
- ✅ Route-station associations

### Analytics & Reporting
- ✅ Dashboard analytics data
- ✅ Station utilization metrics
- ✅ Owner performance tracking
- ✅ Date range filtering

## 🔐 Default Test Users

After running `npm run seed`:

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| admin | admin123 | admin | Full access |
| manager | manager123 | manager | Management features |
| operator1 | operator123 | operator | Limited access |

## 📊 Test Coverage

Current test coverage targets:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Run `npm test -- --coverage` to see detailed coverage report.

## 🛠️ Advanced Testing

### Rate Limiting Tests
```http
# Test multiple rapid requests
GET http://localhost:3001/api/test
GET http://localhost:3001/api/test
GET http://localhost:3001/api/test
```

### Error Handling Tests
```http
# 404 error
GET http://localhost:3001/api/nonexistent

# Validation error
POST http://localhost:3001/api/products
Content-Type: application/json

{
  "name": "",
  "invalid_field": "test"
}
```

### Database Tests
```bash
# Test with fresh database
npm run migrate down
npm run migrate up
npm run seed
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3001
   npx kill-port 3001
   ```

2. **Database Locked**
   ```bash
   # Reset database
   rm -rf data/*.db
   npm run migrate up
   npm run seed
   ```

3. **Test Failures**
   ```bash
   # Clear test cache
   npm test -- --clearCache
   
   # Run tests in band (sequential)
   npm test -- --runInBand
   ```

### Environment Issues

- **Node.js**: Requires v18+
- **SQLite**: In-memory database for tests
- **Ports**: Tests use random ports to avoid conflicts

## 📈 Performance Testing

### Load Testing with Apache Bench
```bash
# Install Apache Bench (ab)
# Test 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/products
```

### Memory Usage
```bash
# Monitor memory during tests
npm test -- --verbose --detectOpenHandles
```

## 🔒 Security Testing

### JWT Token Tests
- ✅ Token expiration handling
- ✅ Invalid token rejection
- ✅ Role-based access control
- ✅ Refresh token rotation

### Input Validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Data sanitization
- ✅ Schema validation

## 📝 Test Reports

Tests generate multiple report formats:
- **Console**: Real-time test results
- **Coverage HTML**: `coverage/lcov-report/index.html`
- **Coverage LCOV**: `coverage/lcov.info`
- **JUnit XML**: For CI/CD integration

## 🚀 CI/CD Integration

Example GitHub Actions workflow:
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run migrate up
      - run: npm run seed
      - run: npm test -- --coverage
```

## 📚 Additional Resources

- **API Documentation**: `http://localhost:3001/api/docs` (when implemented)
- **Database Schema**: `src/scripts/migrations.ts`
- **Type Definitions**: `src/types/index.ts`
- **Validation Rules**: `src/middleware/validation.ts`

---

**Happy Testing!** 🎉

For issues or questions, check the logs in `./logs/` or review the test output for detailed error information.
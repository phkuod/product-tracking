import { config } from '../src/config/index.js';

// Override config for testing
config.port = 0; // Use random port for testing
config.database.path = ':memory:'; // Use in-memory database for tests
config.logging.level = 'error'; // Reduce logging during tests

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);
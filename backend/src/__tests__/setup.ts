import mongoose, { Types } from 'mongoose';
// @ts-ignore
import { MongoMemoryServer } from 'mongodb-memory-server'; // Importação correta
import { User, UserRole, IUser } from '../models/User';
import jwt, { SignOptions } from 'jsonwebtoken';
import { mockLogger } from '../__mocks__/logger';
import { MockRedis } from '../__mocks__/redis';
import swaggerUi from '../__mocks__/swagger-ui-express';

let mongoServer: MongoMemoryServer;
// Extend global for test tokens
declare global {
  // eslint-disable-next-line no-var
  var adminToken: string;
  var userToken: string;
  var adminUser: IUser;
  var regularUser: IUser;
}

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
  close: jest.fn(),
  format: jest.fn(),
  level: 'info',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  }
}));

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
    flushall: jest.fn(),
    quit: jest.fn()
  }));
});

// Mock Swagger UI
jest.mock('swagger-ui-express', () => ({
  serve: jest.fn(),
  setup: jest.fn()
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRE = '1h';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';

// Helper function to create a test token
export const createTestToken = (userId: string, role: UserRole = UserRole.USER) => {
  const options: SignOptions = { expiresIn: '1h' };
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET!,
    options
  );
};

// Connect to in-memory database before tests
beforeAll(async () => {
  try {
    // Close any existing connections
    await mongoose.disconnect();
    await mongoose.connection.close();
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();
    
    await mongoose.connect(mongoUri);

    // Create test users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123!',
      role: UserRole.ADMIN
    }) as IUser;

    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'User123!',
      role: UserRole.USER
    }) as IUser;

    // Create tokens
    const adminToken = createTestToken((adminUser._id as Types.ObjectId).toString(), UserRole.ADMIN);
    const userToken = createTestToken((regularUser._id as Types.ObjectId).toString(), UserRole.USER);

    // Make tokens available globally
    globalThis.adminToken = adminToken;
    globalThis.userToken = userToken;
    globalThis.adminUser = adminUser;
    globalThis.regularUser = regularUser;
  } catch (error) {
    console.error('Error in test setup:', error);
    throw error;
  }
});

// Clear database between tests
beforeEach(async () => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      const excludedCollections = ['users']; // Don't clear test users
      await Promise.all(
        collections
          .filter(collection => !excludedCollections.includes(collection.collectionName))
          .map(collection => collection.deleteMany({}))
      );
    }
    jest.clearAllMocks();
  } catch (error) {
    console.error('Error in test cleanup:', error);
    throw error;
  }
});

// Disconnect and close database after tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error in test teardown:', error);
    throw error;
  }
}); 
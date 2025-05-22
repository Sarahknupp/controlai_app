import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserRole, IUser } from '../models/User';
import jwt, { SignOptions } from 'jsonwebtoken';

let mongoServer: MongoMemoryServer;

// Extend global for test tokens
declare global {
  var adminToken: string;
  var userToken: string;
  var adminUser: IUser;
  var regularUser: IUser;
}

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRE = '1h';

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
    });

    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'User123!',
      role: UserRole.USER
    });

    // Create tokens
    const adminToken = createTestToken(adminUser._id.toString(), UserRole.ADMIN);
    const userToken = createTestToken(regularUser._id.toString(), UserRole.USER);

    // Make tokens available globally
    global.adminToken = adminToken;
    global.userToken = userToken;
    global.adminUser = adminUser;
    global.regularUser = regularUser;
  } catch (error) {
    console.error('Error in test setup:', error);
    throw error;
  }
});

// Clear database between tests
beforeEach(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = await mongoose.connection.db.collections();
      const excludedCollections = ['users']; // Don't clear test users
      await Promise.all(
        collections
          .filter(collection => !excludedCollections.includes(collection.collectionName))
          .map(collection => collection.deleteMany({}))
      );
    }
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
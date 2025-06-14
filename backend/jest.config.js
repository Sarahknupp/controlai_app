/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^firebase-admin$': '<rootDir>/src/__mocks__/firebase-admin.ts',
    '^@nestjs/testing$': '<rootDir>/src/__mocks__/@nestjs/testing.ts',
    '^bull$': '<rootDir>/src/__mocks__/bull.ts',
    '^winston$': '<rootDir>/src/__mocks__/winston.ts',
    '^twilio$': '<rootDir>/src/__mocks__/twilio.ts',
    '^redis$': '<rootDir>/src/__mocks__/redis.ts',
    '^swagger-ui-express$': '<rootDir>/src/__mocks__/swagger-ui-express.ts',
    '^joi$': '<rootDir>/src/__mocks__/joi.ts',
    '^src/controllers/auth.controller$': '<rootDir>/src/__mocks__/auth.controller.ts',
    '^src/controllers/product.controller$': '<rootDir>/src/__mocks__/product.controller.ts',
    '^src/validation/auth.validation$': '<rootDir>/src/__mocks__/auth.validation.ts',
    '^src/validation/product.validation$': '<rootDir>/src/__mocks__/product.validation.ts',
    '^src/middleware/validation$': '<rootDir>/src/__mocks__/validation.middleware.ts',
    '^src/middleware/auth$': '<rootDir>/src/__mocks__/auth.middleware.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/__mocks__/**',
    '!src/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}; 
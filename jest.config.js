module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/backend/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/backend/src/__tests__/setup.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    '!backend/src/**/*.d.ts',
    '!backend/src/**/*.test.ts',
    '!backend/src/__mocks__/**'
  ],
  verbose: true,
  moduleDirectories: ['node_modules', 'backend/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}; 
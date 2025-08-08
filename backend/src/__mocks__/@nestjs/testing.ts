export const Test = jest.fn();
export const TestingModule = jest.fn();

export const createTestingModule = jest.fn(() => ({
  compile: jest.fn().mockResolvedValue({
    get: jest.fn(),
    select: jest.fn(),
    useGlobalPipes: jest.fn().mockReturnThis(),
    useGlobalFilters: jest.fn().mockReturnThis(),
    useGlobalInterceptors: jest.fn().mockReturnThis(),
    useGlobalGuards: jest.fn().mockReturnThis(),
    listen: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined)
  })
}));

export const getRepositoryToken = jest.fn();
export const getConnectionToken = jest.fn();
export const getModelToken = jest.fn();

export default {
  Test,
  TestingModule,
  createTestingModule,
  getRepositoryToken,
  getConnectionToken,
  getModelToken
}; 
import { format } from 'winston';

const mockFormat = {
  combine: jest.fn().mockReturnValue({}),
  timestamp: jest.fn().mockReturnValue({}),
  json: jest.fn().mockReturnValue({}),
  colorize: jest.fn().mockReturnValue({}),
  simple: jest.fn().mockReturnValue({}),
  printf: jest.fn().mockReturnValue({}),
};

const mockTransports = {
  Console: jest.fn().mockImplementation(() => ({
    format: mockFormat,
  })),
  File: jest.fn().mockImplementation(() => ({
    format: mockFormat,
  })),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
  close: jest.fn(),
  format: mockFormat,
  level: 'info',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
};

const createLogger = jest.fn().mockReturnValue(mockLogger);

export default {
  createLogger,
  format: mockFormat,
  transports: mockTransports,
  levels: mockLogger.levels,
}; 
const mockLogger = {
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
};

const mockFormat = {
  combine: jest.fn().mockReturnValue({}),
  timestamp: jest.fn().mockReturnValue({}),
  json: jest.fn().mockReturnValue({}),
  colorize: jest.fn().mockReturnValue({}),
  simple: jest.fn().mockReturnValue({}),
  printf: jest.fn().mockReturnValue({})
};

const mockTransports = {
  File: jest.fn(),
  Console: jest.fn()
};

export const createLogger = jest.fn().mockReturnValue(mockLogger);
export const format = mockFormat;
export const transports = mockTransports;

export default {
  createLogger,
  format,
  transports
}; 
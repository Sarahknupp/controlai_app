const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  add: jest.fn()
};

const mockFormat = {
  combine: jest.fn().mockReturnValue({}),
  timestamp: jest.fn().mockReturnValue({}),
  json: jest.fn().mockReturnValue({}),
  colorize: jest.fn().mockReturnValue({}),
  simple: jest.fn().mockReturnValue({})
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
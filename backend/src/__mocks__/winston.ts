export const createLogger = jest.fn(() => ({
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

export const format = {
  combine: jest.fn(),
  timestamp: jest.fn(),
  printf: jest.fn(),
  colorize: jest.fn(),
  json: jest.fn()
};

export const transports = {
  Console: jest.fn(),
  File: jest.fn()
}; 
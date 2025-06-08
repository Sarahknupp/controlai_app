const format = {
  combine: jest.fn(() => format),
  timestamp: jest.fn(() => format),
  json: jest.fn(() => format),
  colorize: jest.fn(() => format),
  simple: jest.fn(() => format),
  printf: jest.fn(() => format),
  label: jest.fn(() => format),
  errors: jest.fn(() => format)
};

const transports = {
  Console: jest.fn(),
  File: jest.fn()
};

const loggerInstance = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  add: jest.fn(),
  format,
  transports,
  level: 'info',
  silent: false
};

const createLogger = jest.fn(() => loggerInstance);

const logger = Object.assign(loggerInstance, {
  createLogger,
  format,
  transports
});

export { format, transports, createLogger };
export default logger; 
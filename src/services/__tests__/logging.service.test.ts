import { loggingService, LogLevel } from '../logging.service';
import { message as antMessage } from 'antd';

// Mock antd message
jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }
}));

describe('LoggingService', () => {
  beforeEach(() => {
    loggingService.clearLogBuffer();
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should add a log entry to the buffer', () => {
      const message = 'Test message';
      const context = 'TestContext';
      const details = { test: 'data' };

      loggingService.log(message, context, details);

      const logs = loggingService.getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        message,
        context,
        details,
        level: 'info'
      });
    });

    it('should handle missing optional parameters', () => {
      const message = 'Test message';

      loggingService.log(message);

      const logs = loggingService.getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        message,
        context: 'App',
        details: {},
        level: 'info'
      });
    });
  });

  describe('error', () => {
    it('should add an error log entry', () => {
      const message = 'Test error';
      const error = new Error('Test error');
      const context = 'TestContext';
      const details = { test: 'data' };

      loggingService.error(message, error, context, details);

      const logs = loggingService.getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        message,
        context,
        details,
        level: 'error',
        error
      });
    });
  });

  describe('warn', () => {
    it('should add a warning log entry', () => {
      const message = 'Test warning';
      const context = 'TestContext';
      const details = { test: 'data' };

      loggingService.warn(message, context, details);

      const logs = loggingService.getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        message,
        context,
        details,
        level: 'warn'
      });
    });
  });

  describe('debug', () => {
    it('should add a debug log entry', () => {
      const message = 'Test debug';
      const context = 'TestContext';
      const details = { test: 'data' };

      loggingService.debug(message, context, details);

      const logs = loggingService.getLogBuffer();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        message,
        context,
        details,
        level: 'debug'
      });
    });
  });

  describe('getLogBuffer', () => {
    it('should return a copy of the log buffer', () => {
      const message = 'Test message';
      loggingService.log(message);

      const logs = loggingService.getLogBuffer();
      const originalMessage = logs[0].message;

      // Modify the returned array
      logs[0].message = 'Modified message';

      // Get a fresh copy
      const newLogs = loggingService.getLogBuffer();

      // Original message should be unchanged
      expect(newLogs[0].message).toBe(originalMessage);
    });
  });

  describe('clearLogBuffer', () => {
    it('should clear the log buffer', () => {
      loggingService.log('Test message 1');
      loggingService.log('Test message 2');

      expect(loggingService.getLogBuffer()).toHaveLength(2);

      loggingService.clearLogBuffer();

      expect(loggingService.getLogBuffer()).toHaveLength(0);
    });
  });

  describe('buffer size limit', () => {
    it('should maintain maximum buffer size', () => {
      const maxSize = 100;
      
      // Add more logs than the buffer size
      for (let i = 0; i < maxSize + 10; i++) {
        loggingService.info(`Test message ${i}`);
      }
      
      const logs = loggingService.getLogBuffer();
      expect(logs).toHaveLength(maxSize);
      expect(logs[logs.length - 1].message).toBe(`Test message ${maxSize + 9}`);
    });
  });
}); 
import { message as antMessage } from 'antd';
import { LogLevel, LogEntry } from '../types/logging';

export class LoggingService {
  private static instance: LoggingService;
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize: number = 1000;

  private constructor() {}

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private addLogEntry(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  log(message: string, context?: string, details?: any): void {
    this.addLogEntry({
      message,
      level: 'info',
      context,
      details,
      timestamp: new Date().toISOString()
    });
  }

  info(message: string, context?: string, details?: any): void {
    this.addLogEntry({
      message,
      level: 'info',
      context,
      details,
      timestamp: new Date().toISOString()
    });
  }

  error(message: string, context?: string, details?: any, error?: Error): void {
    this.addLogEntry({
      message,
      level: 'error',
      context,
      details,
      error,
      timestamp: new Date().toISOString()
    });
    antMessage.error(message);
  }

  warn(message: string, context?: string, details?: any): void {
    this.addLogEntry({
      message,
      level: 'warn',
      context,
      details,
      timestamp: new Date().toISOString()
    });
    antMessage.warning(message);
  }

  debug(message: string, context?: string, details?: any): void {
    this.addLogEntry({
      message,
      level: 'debug',
      context,
      details,
      timestamp: new Date().toISOString()
    });
  }

  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearLogBuffer(): void {
    this.logBuffer = [];
  }
}

export const loggingService = LoggingService.getInstance(); 
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  message: string;
  level: LogLevel;
  context?: string;
  details?: any;
  timestamp: string;
  error?: Error;
} 
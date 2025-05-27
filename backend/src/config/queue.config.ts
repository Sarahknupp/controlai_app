export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  queueName: string;
  maxRetries: number;
  retryDelay: number;
  concurrency: number;
}

export const queueConfig: QueueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  queueName: process.env.NOTIFICATION_QUEUE_NAME || 'notifications',
  maxRetries: parseInt(process.env.NOTIFICATION_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.NOTIFICATION_RETRY_DELAY || '5000'),
  concurrency: parseInt(process.env.NOTIFICATION_CONCURRENCY || '5')
}; 
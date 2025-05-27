import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/controlai_vendas',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: Number(process.env.REDIS_DB) || 0,
    keyPrefix: 'cache:',
    ttl: Number(process.env.REDIS_TTL) || 3600, // 1 hora
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 86400, // 24 horas
  },
  
  upload: {
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    maxFiles: Number(process.env.MAX_FILES) || 10,
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },
  
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    interval: Number(process.env.MONITORING_INTERVAL) || 60000, // 1 minuto
    retention: Number(process.env.MONITORING_RETENTION) || 7 * 24 * 60 * 60 * 1000, // 7 dias
    thresholds: {
      cpu: Number(process.env.CPU_THRESHOLD) || 80,
      memory: Number(process.env.MEMORY_THRESHOLD) || 85,
      responseTime: Number(process.env.RESPONSE_TIME_THRESHOLD) || 1000,
      errorRate: Number(process.env.ERROR_RATE_THRESHOLD) || 5,
    }
  },
  
  security: {
    rateLimit: {
      windowMs: Number(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
      max: Number(process.env.RATE_LIMIT_MAX) || 100,
    },
    password: {
      minLength: Number(process.env.PASSWORD_MIN_LENGTH) || 6,
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
      requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
      requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
    }
  },
  
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  },
  
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development',
}; 
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'app_controlaivendas',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  ocr: {
    language: process.env.OCR_LANGUAGE || 'por',
    confidence: Number(process.env.OCR_CONFIDENCE) || 0.7,
    timeout: Number(process.env.OCR_TIMEOUT) || 30000,
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key',
}; 
import { config } from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env.test
config({ path: '.env.test' });

// Aumenta o timeout para testes que envolvem banco de dados
jest.setTimeout(30000);

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Set default test environment variables
process.env.NODE_ENV = 'test';
process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
process.env.SMTP_PORT = process.env.SMTP_PORT || '587';
process.env.SMTP_SECURE = process.env.SMTP_SECURE || 'false';
process.env.SMTP_USER = process.env.SMTP_USER || 'test@example.com';
process.env.SMTP_PASS = process.env.SMTP_PASS || 'password';
process.env.SMTP_FROM = process.env.SMTP_FROM || 'noreply@example.com';

process.env.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'test-sid';
process.env.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'test-token';
process.env.TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '+1234567890';

process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'test-project';
process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY || 'test-key';
process.env.FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || 'test@example.com';

process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';

// Mock console methods to keep test output clean
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
}; 
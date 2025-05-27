import winston from 'winston';
import { join } from 'path';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Formato personalizado para logs
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...meta
  });
});

// Configuração dos transportes
const transports = [
  // Console
  new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp(),
      logFormat
    )
  }),
  // Arquivo de logs gerais
  new winston.transports.File({
    filename: join('logs', 'app.log'),
    format: combine(
      timestamp(),
      json()
    )
  }),
  // Arquivo de erros
  new winston.transports.File({
    filename: join('logs', 'error.log'),
    level: 'error',
    format: combine(
      timestamp(),
      json()
    )
  }),
  // Arquivo de métricas
  new winston.transports.File({
    filename: join('logs', 'metrics.log'),
    format: combine(
      timestamp(),
      json()
    )
  }),
  // Arquivo de segurança
  new winston.transports.File({
    filename: join('logs', 'security.log'),
    format: combine(
      timestamp(),
      json()
    )
  })
];

// Configuração do logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    json()
  ),
  transports,
  // Não exita em caso de erro
  exitOnError: false
});

// Stream para Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Função para rotacionar logs
export const rotateLogs = () => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const maxFiles = 5;

  transports.forEach(transport => {
    if (transport instanceof winston.transports.File) {
      transport.maxsize = maxSize;
      transport.maxFiles = maxFiles;
    }
  });
}; 
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Configurações do MongoDB
const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/controlai_vendas';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

// Opções de conexão otimizadas para Atlas
const MONGODB_OPTIONS = {
  retryAttempts: 5,
  retryDelay: 1000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  tlsInsecure: false
};

// Configurações do Mongoose
mongoose.set('strictQuery', true);
mongoose.set('debug', process.env['NODE_ENV'] === 'development');

// Eventos de conexão
mongoose.connection.on('connected', () => {
  logger.info('MongoDB Atlas conectado com sucesso');
});

mongoose.connection.on('error', (err) => {
  logger.error('Erro na conexão com MongoDB Atlas:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB Atlas desconectado');
});

// Função para conectar ao MongoDB
export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
    logger.info(`Conectado ao MongoDB Atlas: ${mongoose.connection.name}`);
    logger.info(`Host: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('Erro ao conectar ao MongoDB Atlas:', error);
    process.exit(1);
  }
};

// Função para desconectar do MongoDB
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Desconectado do MongoDB Atlas');
  } catch (error) {
    logger.error('Erro ao desconectar do MongoDB Atlas:', error);
  }
};

// Função para verificar o status da conexão
export const getDatabaseStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.models),
  };
}; 

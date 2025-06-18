import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase, getDatabaseStatus } from '../config/database';
import { logger } from '../utils/logger';

// Carrega variáveis de ambiente
dotenv.config();

async function setupDatabase() {
  try {
    logger.info('🔄 Iniciando configuração do banco de dados...');

    // Conecta ao MongoDB
    await connectDatabase();

    // Verifica o status da conexão
    const status = getDatabaseStatus();
    logger.info('📊 Status do banco de dados:', status);

    // Lista as coleções disponíveis
    if (status.connected) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      logger.info('📋 Coleções disponíveis:', collections.map(c => c.name));
    }

    logger.info('✅ Configuração do banco de dados concluída com sucesso!');
  } catch (error) {
    logger.error('❌ Erro durante a configuração do banco de dados:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executa a configuração
setupDatabase(); 
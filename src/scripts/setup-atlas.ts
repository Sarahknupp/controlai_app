import dotenv from 'dotenv';
import { connectDatabase, getDatabaseStatus } from '../config/database';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Carrega variáveis de ambiente
dotenv.config();

async function setupAtlas() {
  try {
    logger.info('🔄 Iniciando configuração do MongoDB Atlas...');

    // Verifica se a URI do Atlas está configurada
    if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.includes('mongodb+srv://')) {
      logger.error('❌ URI do MongoDB Atlas não configurada corretamente');
      logger.info('📝 Por favor, configure a variável MONGODB_URI no arquivo .env com a string de conexão do Atlas');
      process.exit(1);
    }

    // Conecta ao MongoDB Atlas
    await connectDatabase();

    // Verifica o status da conexão
    const status = getDatabaseStatus();
    logger.info('📊 Status da conexão com Atlas:', status);

    // Lista as coleções disponíveis
    if (status.connected) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      logger.info('📋 Coleções disponíveis:', collections.map(c => c.name));
      
      // Verifica a latência
      const startTime = Date.now();
      await mongoose.connection.db.admin().ping();
      const latency = Date.now() - startTime;
      logger.info(`⏱️ Latência: ${latency}ms`);
    }

    logger.info('✅ Configuração do MongoDB Atlas concluída com sucesso!');
  } catch (error) {
    logger.error('❌ Erro durante a configuração do MongoDB Atlas:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executa a configuração
setupAtlas(); 
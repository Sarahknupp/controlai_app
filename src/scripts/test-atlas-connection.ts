import dotenv from 'dotenv';
import { connectDatabase, getDatabaseStatus } from '../config/database';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Carrega variáveis de ambiente
dotenv.config();

async function testAtlasConnection() {
  try {
    logger.info('🔄 Testando conexão com MongoDB Atlas...');

    // Verifica se a URI do Atlas está configurada
    if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.includes('mongodb+srv://')) {
      logger.error('❌ URI do MongoDB Atlas não configurada corretamente');
      logger.info('📝 Por favor, configure a variável MONGODB_URI no arquivo .env');
      process.exit(1);
    }

    // Conecta ao MongoDB Atlas
    await connectDatabase();

    // Verifica o status da conexão
    const status = getDatabaseStatus();
    logger.info('📊 Status da conexão:', status);

    // Testa operações básicas
    if (status.connected) {
      // Lista as coleções
      const collections = await mongoose.connection.db.listCollections().toArray();
      logger.info('📋 Coleções disponíveis:', collections.map(c => c.name));

      // Testa a latência
      const startTime = Date.now();
      await mongoose.connection.db.admin().ping();
      const latency = Date.now() - startTime;
      logger.info(`⏱️ Latência: ${latency}ms`);

      // Verifica o status do cluster
      const serverStatus = await mongoose.connection.db.admin().serverStatus();
      logger.info('📈 Status do servidor:', {
        version: serverStatus.version,
        uptime: serverStatus.uptime,
        connections: serverStatus.connections,
        network: serverStatus.network,
        opcounters: serverStatus.opcounters
      });
    }

    logger.info('✅ Teste de conexão concluído com sucesso!');
  } catch (error) {
    logger.error('❌ Erro durante o teste de conexão:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Executa o teste
testAtlasConnection(); 
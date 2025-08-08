import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Carrega variáveis de ambiente
dotenv.config();

interface BackupConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number; // em dias
  time: string; // formato HH:mm
  compression: boolean;
  encryption: boolean;
}

async function setupBackups() {
  try {
    logger.info('🔄 Configurando backups automáticos no MongoDB Atlas...');

    // Conecta ao MongoDB Atlas
    await connectDatabase();

    // Configuração padrão de backups
    const backupConfig: BackupConfig = {
      frequency: 'daily',
      retention: 7, // 7 dias
      time: '02:00', // 2 AM
      compression: true,
      encryption: true
    };

    // Configura o backup no Atlas
    const admin = mongoose.connection.db.admin();
    
    // Verifica se o backup já está configurado
    const currentConfig = await admin.getBackupConfig();
    logger.info('📋 Configuração atual de backup:', currentConfig);

    // Configura o backup
    await admin.configureBackup({
      ...backupConfig,
      // Configurações específicas do Atlas
      clusterId: process.env.MONGODB_CLUSTER_ID,
      projectId: process.env.MONGODB_PROJECT_ID,
      apiKey: process.env.MONGODB_API_KEY
    });

    // Verifica o status do backup
    const backupStatus = await admin.getBackupStatus();
    logger.info('📊 Status do backup:', backupStatus);

    // Configura notificações
    await admin.configureBackupNotifications({
      email: process.env.BACKUP_NOTIFICATION_EMAIL,
      slack: process.env.BACKUP_NOTIFICATION_SLACK_WEBHOOK,
      onSuccess: true,
      onFailure: true,
      onWarning: true
    });

    logger.info('✅ Configuração de backups concluída com sucesso!');
    logger.info('📝 Resumo da configuração:', {
      frequência: backupConfig.frequency,
      retenção: `${backupConfig.retention} dias`,
      horário: backupConfig.time,
      compressão: backupConfig.compression ? 'Ativada' : 'Desativada',
      criptografia: backupConfig.encryption ? 'Ativada' : 'Desativada'
    });

  } catch (error) {
    logger.error('❌ Erro ao configurar backups:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Executa a configuração
setupBackups(); 
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Configuração para evitar warnings do Mongoose
mongoose.set('strictQuery', true);

const MONGODB_URI = process.env.MONGODB_URI ??
  'mongodb://localhost:27017/controlai_vendas';

async function testConnection() {
  try {
    console.log('🔄 Tentando conectar ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Testar se podemos listar as coleções
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📋 Coleções disponíveis:', collections.map(c => c.name));
    }
    
    await mongoose.connection.close();
    console.log('🔒 Conexão fechada');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    if (error instanceof Error) {
      console.error('Detalhes do erro:', error.message);
    }
  } finally {
    process.exit();
  }
}

testConnection(); 
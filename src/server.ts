import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import paymentRoutes from './routes/payment.routes';
import { errorHandler } from './middleware/error';

dotenv.config();

// Configuração do Mongoose
mongoose.set('strictQuery', true);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com MongoDB
const MONGODB_URI = 'mongodb+srv://sarahjenniferalvesknupp:Brocolis3388@controlai.vj9ztrr.mongodb.net/controlai_vendas?retryWrites=true&w=majority';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/payments', paymentRoutes);

// Rota de status/health check
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'API ControlAI Vendas',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Error Handler (deve ser o último middleware)
app.use(errorHandler);

// Inicialização do servidor
const PORT = parseInt(process.env.PORT, 10) || 3001;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('🔥 Erro não tratado:', error);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Sinal SIGTERM recebido. Encerrando servidor...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer(); 
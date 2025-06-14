import app from './app';
import { logger } from './utils/logger';
import { Request, Response } from 'express';

const PORT = process.env.PORT || 5000;

// Rota raiz
app.get('/', (_req: Request, res: Response) => res.status(200).json({ message: 'Welcome to ControlAI ERP API' }));

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 
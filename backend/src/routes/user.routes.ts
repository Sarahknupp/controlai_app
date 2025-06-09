import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Middleware de autenticação
router.use(authenticate);

// Rota para obter o perfil do usuário
router.get('/profile', (req, res): void => {
  res.json({ message: 'Perfil do usuário' });
});

// Rota para atualizar o perfil do usuário
router.put('/profile', (req, res): void => {
  res.json({ message: 'Perfil do usuário atualizado' });
});

export default router; 
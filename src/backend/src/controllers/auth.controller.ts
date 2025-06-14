import { Request, Response, NextFunction } from 'express';
import { User } from '../../backend/src/models/User';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export class AuthController {
  /**
   * Login de usuário
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, senha } = req.body;

      // Busca o usuário pelo email
      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError('Email ou senha inválidos', 401, 'AUTH_002');
      }

      // Verifica se o usuário está ativo
      if (!user.ativo) {
        throw new ApiError('Usuário inativo', 401, 'AUTH_002');
      }

      // Verifica a senha
      const senhaCorreta = await user.comparePassword(senha);
      if (!senhaCorreta) {
        throw new ApiError('Email ou senha inválidos', 401, 'AUTH_002');
      }

      // Atualiza último login
      user.ultimoLogin = new Date();
      await user.save();

      // Gera tokens
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            nome: user.nome,
            email: user.email,
            cargo: user.cargo,
            permissoes: user.permissoes
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Renovar token de acesso usando refresh token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ApiError('Refresh token não fornecido', 400, 'AUTH_001');
      }

      // Verifica o refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };

      // Busca o usuário
      const user = await User.findById(decoded.id);
      if (!user || !user.ativo) {
        throw new ApiError('Token inválido', 401, 'AUTH_001');
      }

      // Gera novo access token
      const accessToken = user.generateAuthToken();

      res.json({
        success: true,
        data: {
          accessToken
        }
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        next(new ApiError('Refresh token expirado', 401, 'AUTH_001'));
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        next(new ApiError('Refresh token inválido', 401, 'AUTH_001'));
        return;
      }
      next(error);
    }
  }

  /**
   * Obter dados do usuário logado
   */
  static async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        throw new ApiError('Usuário não encontrado', 404, 'AUTH_002');
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            nome: user.nome,
            email: user.email,
            cargo: user.cargo,
            permissoes: user.permissoes,
            ultimoLogin: user.ultimoLogin
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Alterar senha do usuário logado
   */
  static async alterarSenha(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { senhaAtual, novaSenha } = req.body;

      const user = await User.findById(req.user?.id);
      if (!user) {
        throw new ApiError('Usuário não encontrado', 404, 'AUTH_002');
      }

      // Verifica a senha atual
      const senhaCorreta = await user.comparePassword(senhaAtual);
      if (!senhaCorreta) {
        throw new ApiError('Senha atual incorreta', 401, 'AUTH_002');
      }

      // Atualiza a senha
      user.senha = novaSenha;
      await user.save();

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
} 
/**
 * Authentication middleware
 * @module middleware/authenticate
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../../backend/src/models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    cargo: string;
    permissoes: string[];
  };
}

/**
 * Middleware to authenticate requests using JWT
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 * @throws {ApiError} If token is missing or invalid
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verifica se o token foi fornecido
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Token não fornecido'
        }
      });
      return;
    }

    // Extrai o token do header
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Token mal formatado'
        }
      });
      return;
    }

    try {
      // Verifica e decodifica o token
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        cargo: string;
        permissoes: string[];
      };

      // Verifica se o usuário ainda existe e está ativo
      const user = await User.findById(decoded.id);
      if (!user || !user.ativo) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_002',
            message: 'Usuário não encontrado ou inativo'
          }
        });
        return;
      }

      // Adiciona os dados do usuário à requisição
      req.user = {
        id: decoded.id,
        email: decoded.email,
        cargo: decoded.cargo,
        permissoes: decoded.permissoes
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_001',
            message: 'Token expirado'
          }
        });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_001',
            message: 'Token inválido'
          }
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    next(error);
  }
}; 
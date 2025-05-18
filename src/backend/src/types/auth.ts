/**
 * Authentication and authorization types
 * @module types/auth
 */

import { Request } from 'express';

/**
 * Available user roles in the system
 */
export type UserRole = 'admin' | 'gerente' | 'vendedor' | 'estoquista';

/**
 * Available permissions in the system
 */
export type Permission =
  | 'criar_produto'
  | 'editar_produto'
  | 'excluir_produto'
  | 'criar_venda'
  | 'cancelar_venda'
  | 'ver_relatorios'
  | 'gerenciar_usuarios'
  | 'gerenciar_estoque';

/**
 * JWT payload structure
 */
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  cargo: UserRole;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

/**
 * Request with authenticated user
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
} 
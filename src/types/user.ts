/**
 * Tipos e interfaces relacionados a usuários
 * @module types/user
 * @description Tipos para gerenciamento de usuários, permissões e atividades
 */

/**
 * Funções disponíveis no sistema
 * @type {string}
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SELLER = 'seller',
  INVENTORY = 'inventory'
}

/**
 * Status do usuário no sistema
 * @type {string}
 */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'blocked';

/**
 * Interface de usuário representando um usuário do sistema
 * @interface User
 * @property {string} id - Identificador único do usuário
 * @property {string} name - Nome completo do usuário
 * @property {string} email - Endereço de e-mail do usuário (usado para login)
 * @property {string} password - Senha do usuário (criptografada em produção)
 * @property {UserRole} role - Função do usuário no sistema
 * @property {UserStatus} [status] - Status atual da conta do usuário
 * @property {Date} [lastLogin] - Data e hora do último login bem-sucedido
 * @property {Array<string>} [permissions] - Permissões adicionais concedidas ao usuário
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user';
  settings: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailNotifications: boolean;
    timezone: string;
    dateFormat: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Preferências do usuário para personalização da experiência
 * @interface UserPreferences
 * @property {string} language - Código do idioma preferido (ex: 'pt-BR')
 * @property {string} theme - Preferência de tema da interface ('light' | 'dark')
 * @property {boolean} notifications - Se deve receber notificações
 * @property {Array<string>} dashboardWidgets - Lista de widgets habilitados no painel
 */
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  dashboardWidgets: Array<string>;
}

/**
 * Informações da sessão do usuário
 * @interface UserSession
 * @property {string} id - Identificador da sessão
 * @property {string} userId - ID do usuário dono da sessão
 * @property {string} token - Token JWT ou de sessão
 * @property {Date} createdAt - Data e hora de criação da sessão
 * @property {Date} expiresAt - Data e hora de expiração da sessão
 * @property {string} deviceInfo - Informações sobre o dispositivo utilizado
 * @property {string} ipAddress - Endereço IP do cliente
 */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  deviceInfo: string;
  ipAddress: string;
}

/**
 * Registro de atividade do usuário
 * @interface UserActivity
 * @property {string} id - Identificador do registro de atividade
 * @property {string} userId - ID do usuário que realizou a ação
 * @property {string} action - Tipo de ação realizada
 * @property {string} description - Descrição detalhada da atividade
 * @property {Date} timestamp - Data e hora da ocorrência
 * @property {Record<string, unknown>} metadata - Informações contextuais adicionais
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}
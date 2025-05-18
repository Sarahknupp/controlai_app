/**
 * User model for the ControlAI Sales System
 * @module models/User
 */

import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

/**
 * Interface representing a user document in MongoDB
 * @interface IUser
 * @extends Document
 */
export interface IUser extends Document {
  /** User's full name */
  nome: string;
  /** User's email address */
  email: string;
  /** User's password (hashed) */
  senha: string;
  /** User's role */
  cargo: string;
  /** User's permissions */
  permissoes: string[];
  /** Whether the user is active */
  ativo: boolean;
  /** Last login date */
  ultimoLogin: Date;
  /** Creation date */
  createdAt: Date;
  /** Last update date */
  updatedAt: Date;
  /** Method to check if password matches */
  comparePassword(candidatePassword: string): Promise<boolean>;
  /** Method to generate JWT token */
  generateAuthToken(): string;
  /** Method to generate refresh token */
  generateRefreshToken(): string;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

type UserModel = Model<IUser, {}, IUserMethods>;

/**
 * User schema definition
 * @const {Schema}
 */
const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter no mínimo 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
  },
  cargo: {
    type: String,
    required: [true, 'Cargo é obrigatório'],
    enum: ['admin', 'gerente', 'vendedor', 'estoquista']
  },
  permissoes: [{
    type: String,
    enum: [
      'criar_produto',
      'editar_produto',
      'excluir_produto',
      'criar_venda',
      'cancelar_venda',
      'ver_relatorios',
      'gerenciar_usuarios',
      'gerenciar_estoque'
    ]
  }],
  ativo: {
    type: Boolean,
    default: true
  },
  ultimoLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      delete ret.senha;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Compare password method
 * @method comparePassword
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} Whether the password matches
 */
userSchema.method('comparePassword', async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.senha);
});

/**
 * Generate JWT token method
 * @method generateAuthToken
 * @returns {string} JWT token
 */
userSchema.method('generateAuthToken', function(): string {
  const payload = { id: this._id };
  const options: SignOptions = { 
    expiresIn: parseInt(config.jwt.expiresIn) || '1h'
  };
  return jwt.sign(payload, config.jwt.secret, options);
});

/**
 * Generate refresh token method
 * @method generateRefreshToken
 * @returns {string} Refresh token
 */
userSchema.method('generateRefreshToken', function(): string {
  const payload = { id: this._id };
  const options: SignOptions = { 
    expiresIn: parseInt(config.jwt.refreshExpiresIn) || '7d'
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
});

/**
 * User model
 * @const {Model<IUser>}
 */
export const User = mongoose.model<IUser, UserModel>('User', userSchema); 
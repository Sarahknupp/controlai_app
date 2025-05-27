import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  USER = 'USER'
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  document?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  permissions?: string[];
  preferences?: {
    language: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  isEmailVerified: boolean;
  loginAttempts: number;
  lockUntil?: Date;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  generatePasswordResetToken(): Promise<string>;
  generateEmailVerificationToken(): Promise<string>;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  phone?: string;
  document?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark';
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  role?: UserRole;
  isActive?: boolean;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark';
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export interface UserResult {
  users: IUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
} 
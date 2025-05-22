import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';
import { NotificationService } from './notification.service';
import { SettingsService } from './settings.service';

export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  lastLogin?: Date;
  failedLoginAttempts: number;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class UserService {
  private users: Map<string, User>;
  private auditService: AuditService;
  private notificationService: NotificationService;
  private settingsService: SettingsService;

  constructor() {
    this.users = new Map();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.settingsService = new SettingsService();
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      // Validate email uniqueness
      const existingUser = Array.from(this.users.values()).find(u => u.email === dto.email);
      if (existingUser) {
        throw new Error(`User with email ${dto.email} already exists`);
      }

      const user: User = {
        id: uuidv4(),
        email: dto.email,
        name: dto.name,
        role: dto.role,
        status: 'PENDING',
        passwordHash: await this.hashPassword(dto.password),
        failedLoginAttempts: 0,
        preferences: dto.preferences,
        metadata: dto.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.users.set(user.id, user);

      // Create user preferences
      await this.settingsService.createUserPreferences(user.id, {
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        theme: 'LIGHT',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      });

      // Log the creation
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.USER,
        entityId: user.id,
        userId: 'system',
        details: `Created user: ${user.email}`,
        status: 'success'
      });

      // Send welcome notification
      await this.notificationService.createNotification({
        type: 'EMAIL',
        title: 'Bem-vindo ao ControlAI Vendas',
        message: `Olá ${user.name}, bem-vindo ao ControlAI Vendas! Sua conta foi criada com sucesso.`,
        recipient: user.email,
        metadata: {
          userId: user.id
        }
      });

      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, dto: UpdateUserDto, updatedBy: string): Promise<User> {
    try {
      const user = this.users.get(id);
      if (!user) {
        throw new Error(`User not found: ${id}`);
      }

      const previousState = { ...user };

      // Update user fields
      if (dto.name) user.name = dto.name;
      if (dto.email) user.email = dto.email;
      if (dto.role) user.role = dto.role;
      if (dto.status) user.status = dto.status;
      if (dto.preferences) user.preferences = { ...user.preferences, ...dto.preferences };
      if (dto.metadata) user.metadata = { ...user.metadata, ...dto.metadata };

      user.updatedAt = new Date();

      this.users.set(id, user);

      // Log the update
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: user.id,
        userId: updatedBy,
        details: `Updated user: ${user.email}`,
        status: 'success'
      });

      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string, deletedBy: string): Promise<void> {
    try {
      const user = this.users.get(id);
      if (!user) {
        throw new Error(`User not found: ${id}`);
      }

      this.users.delete(id);

      // Delete user preferences
      await this.settingsService.deleteUserPreferences(id);

      // Log the deletion
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.USER,
        entityId: id,
        userId: deletedBy,
        details: `Deleted user: ${user.email}`,
        status: 'success'
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUsers(
    role?: UserRole,
    status?: UserStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number }> {
    let filteredUsers = Array.from(this.users.values());

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = filteredUsers.slice(start, end);

    return {
      users: paginatedUsers,
      total: filteredUsers.length
    };
  }

  async authenticateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.status !== 'ACTIVE') {
        throw new Error(`User account is ${user.status.toLowerCase()}`);
      }

      const isValidPassword = await this.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 5) {
          user.status = 'SUSPENDED';
          await this.notificationService.createNotification({
            type: 'EMAIL',
            title: 'Conta Suspensa',
            message: 'Sua conta foi suspensa devido a múltiplas tentativas de login inválidas.',
            recipient: user.email,
            metadata: {
              userId: user.id
            }
          });
        }
        this.users.set(user.id, user);
        throw new Error('Invalid credentials');
      }

      // Reset failed login attempts on successful login
      user.failedLoginAttempts = 0;
      user.lastLogin = new Date();
      this.users.set(user.id, user);

      // Log the login
      await this.auditService.logAction({
        action: AuditAction.LOGIN,
        entityType: EntityType.USER,
        entityId: user.id,
        userId: user.id,
        details: `User logged in: ${user.email}`,
        status: 'success'
      });

      return user;
    } catch (error) {
      logger.error('Error authenticating user:', error);
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      const isValidPassword = await this.verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      user.passwordHash = await this.hashPassword(newPassword);
      user.updatedAt = new Date();
      this.users.set(userId, user);

      // Log the password change
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: userId,
        userId,
        details: 'Password changed',
        status: 'success'
      });

      // Send password changed notification
      await this.notificationService.createNotification({
        type: 'EMAIL',
        title: 'Senha Alterada',
        message: 'Sua senha foi alterada com sucesso.',
        recipient: user.email,
        metadata: {
          userId: user.id
        }
      });
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error(`User not found: ${email}`);
      }

      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      this.users.set(user.id, user);

      // Send password reset notification
      await this.notificationService.createNotification({
        type: 'EMAIL',
        title: 'Redefinição de Senha',
        message: `Para redefinir sua senha, use o token: ${resetToken}`,
        recipient: user.email,
        metadata: {
          userId: user.id,
          resetToken,
          resetExpires
        }
      });
    } catch (error) {
      logger.error('Error requesting password reset:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = Array.from(this.users.values()).find(
        u => u.passwordResetToken === token && u.passwordResetExpires && u.passwordResetExpires > new Date()
      );

      if (!user) {
        throw new Error('Invalid or expired password reset token');
      }

      user.passwordHash = await this.hashPassword(newPassword);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.updatedAt = new Date();
      this.users.set(user.id, user);

      // Log the password reset
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: user.id,
        userId: user.id,
        details: 'Password reset',
        status: 'success'
      });

      // Send password reset complete notification
      await this.notificationService.createNotification({
        type: 'EMAIL',
        title: 'Senha Redefinida',
        message: 'Sua senha foi redefinida com sucesso.',
        recipient: user.email,
        metadata: {
          userId: user.id
        }
      });
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw error;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    // TODO: Implement proper password hashing
    return password;
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // TODO: Implement proper password verification
    return password === hash;
  }
} 
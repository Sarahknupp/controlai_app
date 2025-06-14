import { User, IUserDocument } from '../models/User';
import { CreateUserDto, UpdateUserDto, UserFilters, UserResult, UserRole } from '../types/user';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { SecurityMonitorService } from './security-monitor.service';
import { logger } from '../utils/logger';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import bcrypt from 'bcryptjs';

export class UserService {
  private auditService: AuditService;
  private notificationService: NotificationService;
  private emailService: EmailService;
  private securityMonitor: SecurityMonitorService;

  constructor() {
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.emailService = new EmailService({
      host: process.env.EMAIL_HOST || '',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      },
      from: process.env.EMAIL_FROM || ''
    });
    this.securityMonitor = SecurityMonitorService.getInstance();
  }

  async createUser(dto: CreateUserDto): Promise<IUserDocument> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: dto.email });
      if (existingUser) {
        throw new Error(`User with email ${dto.email} already exists`);
      }

      // Create user
      const user = await User.create({
        ...dto,
        isEmailVerified: false
      });

      // Generate verification token and send email
      const verificationToken = await user.generateEmailVerificationToken();
      await this.emailService.sendEmailVerification(user.email, verificationToken);

      // Log the creation
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.USER,
        entityId: user._id.toString(),
        userId: 'system',
        details: `Created user: ${user.email}`,
        status: 'success'
      });

      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, dto: UpdateUserDto, updatedBy: string): Promise<IUserDocument> {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new NotFoundError(`User not found: ${id}`);
      }

      // Update user fields
      Object.assign(user, dto);
      await user.save();

      // Log the update
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: user._id.toString(),
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
      const user = await User.findById(id);
      if (!user) {
        throw new NotFoundError(`User not found: ${id}`);
      }

      await user.deleteOne();

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

  async getUsers(filters: UserFilters): Promise<UserResult> {
    try {
      const query: any = {};

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }

      if (filters.role) query.role = filters.role;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.isEmailVerified !== undefined) query.isEmailVerified = filters.isEmailVerified;

      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      const sort: any = {};
      if (filters.sortBy) {
        sort[filters.sortBy] = filters.sortOrder === 'desc' ? -1 : 1;
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        User.countDocuments(query)
      ]);

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  async authenticateUser(email: string, password: string): Promise<IUserDocument> {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        this.securityMonitor.logLoginAttempt({ email } as any, false);
        throw new UnauthorizedError('Invalid credentials');
      }

      if (!user.isActive) {
        this.securityMonitor.logSecurityEvent('INACTIVE_USER', { userId: user._id });
        throw new UnauthorizedError('User account is inactive');
      }

      if (user.isLocked()) {
        this.securityMonitor.logSecurityEvent('LOCKED_ACCOUNT', { userId: user._id });
        throw new UnauthorizedError('Account is locked. Please try again later.');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        await user.incrementLoginAttempts();
        this.securityMonitor.logLoginAttempt({ email } as any, false, user);
        throw new UnauthorizedError('Invalid credentials');
      }

      await user.resetLoginAttempts();
      this.securityMonitor.logLoginAttempt({ email } as any, true, user);

      return user;
    } catch (error) {
      logger.error('Error authenticating user:', error);
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      this.securityMonitor.logPasswordChange(user);
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: user._id.toString(),
        userId: user._id.toString(),
        details: 'Password changed',
        status: 'success'
      });
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal that the user doesn't exist
        return;
      }

      const resetToken = await user.generatePasswordResetToken();
      await this.emailService.sendPasswordReset(email, resetToken);

      this.securityMonitor.logPasswordReset(user, true);
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: user._id.toString(),
        userId: user._id.toString(),
        details: 'Password reset requested',
        status: 'success'
      });
    } catch (error) {
      logger.error('Error requesting password reset:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        throw new UnauthorizedError('Invalid or expired reset token');
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      this.securityMonitor.logPasswordReset(user, true);
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: user._id.toString(),
        userId: user._id.toString(),
        details: 'Password reset completed',
        status: 'success'
      });
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpire: { $gt: Date.now() }
      });

      if (!user) {
        throw new UnauthorizedError('Invalid or expired verification token');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save();

      this.securityMonitor.logEmailVerification(user, true);
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: user._id.toString(),
        userId: user._id.toString(),
        details: 'Email verified',
        status: 'success'
      });
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }
} 
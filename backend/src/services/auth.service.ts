import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';
import { UserService, UserRole } from './user.service';
import { NotificationService } from './notification.service';

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
  sessionId: string;
  exp: number;
}

export class AuthService {
  private sessions: Map<string, Session>;
  private userService: UserService;
  private auditService: AuditService;
  private notificationService: NotificationService;

  constructor() {
    this.sessions = new Map();
    this.userService = new UserService();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
  }

  async login(
    email: string,
    password: string,
    deviceInfo?: Session['deviceInfo']
  ): Promise<{ user: any; session: Session }> {
    try {
      // Authenticate user
      const user = await this.userService.authenticateUser(email, password);

      // Create session
      const session = await this.createSession(user.id, deviceInfo);

      // Log the login
      await this.auditService.logAction({
        action: AuditAction.LOGIN,
        entityType: EntityType.USER,
        entityId: user.id,
        userId: user.id,
        details: `User logged in from ${deviceInfo?.deviceType || 'unknown device'}`,
        status: 'success'
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          preferences: user.preferences
        },
        session
      };
    } catch (error) {
      logger.error('Error during login:', error);
      throw error;
    }
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.userId !== userId) {
        throw new Error('Unauthorized');
      }

      this.sessions.delete(sessionId);

      // Log the logout
      await this.auditService.logAction({
        action: AuditAction.LOGOUT,
        entityType: EntityType.USER,
        entityId: userId,
        userId,
        details: 'User logged out',
        status: 'success'
      });
    } catch (error) {
      logger.error('Error during logout:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<Session> {
    try {
      const session = Array.from(this.sessions.values()).find(
        s => s.refreshToken === refreshToken && s.refreshExpiresAt > new Date()
      );

      if (!session) {
        throw new Error('Invalid or expired refresh token');
      }

      // Generate new tokens
      const newToken = uuidv4();
      const newRefreshToken = uuidv4();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 3600000); // 7 days

      // Update session
      session.token = newToken;
      session.refreshToken = newRefreshToken;
      session.expiresAt = expiresAt;
      session.refreshExpiresAt = refreshExpiresAt;
      session.updatedAt = new Date();

      this.sessions.set(session.id, session);

      // Log the token refresh
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: session.userId,
        userId: session.userId,
        details: 'Session token refreshed',
        status: 'success'
      });

      return session;
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw error;
    }
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const session = Array.from(this.sessions.values()).find(
        s => s.token === token && s.expiresAt > new Date()
      );

      if (!session) {
        throw new Error('Invalid or expired token');
      }

      const user = await this.userService.getUser(session.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.status !== 'ACTIVE') {
        throw new Error(`User account is ${user.status.toLowerCase()}`);
      }

      return {
        userId: user.id,
        role: user.role,
        sessionId: session.id,
        exp: Math.floor(session.expiresAt.getTime() / 1000)
      };
    } catch (error) {
      logger.error('Error validating token:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  async revokeSession(sessionId: string, revokedBy: string): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      this.sessions.delete(sessionId);

      // Log the session revocation
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.USER,
        entityId: session.userId,
        userId: revokedBy,
        details: `Session revoked by ${revokedBy}`,
        status: 'success'
      });

      // Notify user about session revocation
      const user = await this.userService.getUser(session.userId);
      if (user) {
        await this.notificationService.createNotification({
          type: 'EMAIL',
          title: 'Sessão Revogada',
          message: 'Uma de suas sessões foi revogada por motivos de segurança.',
          recipient: user.email,
          metadata: {
            userId: user.id,
            sessionId,
            deviceInfo: session.deviceInfo
          }
        });
      }
    } catch (error) {
      logger.error('Error revoking session:', error);
      throw error;
    }
  }

  async revokeAllSessions(userId: string, revokedBy: string): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId);
      
      for (const session of sessions) {
        await this.revokeSession(session.id, revokedBy);
      }

      // Log the mass session revocation
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.USER,
        entityId: userId,
        userId: revokedBy,
        details: `All sessions revoked by ${revokedBy}`,
        status: 'success'
      });
    } catch (error) {
      logger.error('Error revoking all sessions:', error);
      throw error;
    }
  }

  private async createSession(
    userId: string,
    deviceInfo?: Session['deviceInfo']
  ): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
      userId,
      token: uuidv4(),
      refreshToken: uuidv4(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      refreshExpiresAt: new Date(Date.now() + 7 * 24 * 3600000), // 7 days
      deviceInfo,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async cleanupExpiredSessions(): Promise<void> {
    try {
      const now = new Date();
      for (const [id, session] of this.sessions.entries()) {
        if (session.refreshExpiresAt < now) {
          this.sessions.delete(id);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }
} 
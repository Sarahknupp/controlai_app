import { Request } from 'express';
import { logger } from '../utils/logger';
import { IUserDocument } from '../models/User';

export class SecurityMonitorService {
  private static instance: SecurityMonitorService;

  private constructor() {}

  public static getInstance(): SecurityMonitorService {
    if (!SecurityMonitorService.instance) {
      SecurityMonitorService.instance = new SecurityMonitorService();
    }
    return SecurityMonitorService.instance;
  }

  public logSecurityEvent(event: string, metadata: Record<string, any> = {}): void {
    logger.info(`Security event: ${event}`, metadata);
  }

  public logRateLimitExceeded(req: Request): void {
    logger.warn(`Rate limit exceeded: ${req.ip} ${req.method} ${req.path}`);
  }

  public logAction(data: Record<string, any>): void {
    logger.info('Security action', data);
  }

  public logLoginAttempt(user: Partial<IUserDocument>, success: boolean, existingUser?: IUserDocument): void {
    logger.info(`Login attempt for ${user.email} success=${success}`);
  }

  public logPasswordChange(user: IUserDocument): void {
    logger.info(`Password changed for user ${user._id}`);
  }

  public logPasswordReset(user: IUserDocument, success: boolean): void {
    logger.info(`Password reset for user ${user._id} success=${success}`);
  }

  public logEmailVerification(user: IUserDocument, success: boolean): void {
    logger.info(`Email verification for user ${user._id} success=${success}`);
  }
}

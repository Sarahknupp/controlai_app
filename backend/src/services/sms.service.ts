import twilio from 'twilio';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface SMSOptions {
  to: string;
  message: string;
  metadata?: Record<string, any>;
}

export class SMSService {
  private client: twilio.Twilio;
  private fromNumber: string;
  private auditService: AuditService;

  constructor(config: SMSConfig) {
    this.client = twilio(config.accountSid, config.authToken);
    this.fromNumber = config.fromNumber;
    this.auditService = new AuditService();
  }

  async sendSMS(options: SMSOptions): Promise<void> {
    try {
      const message = await this.client.messages.create({
        body: options.message,
        from: this.fromNumber,
        to: options.to
      });

      // Log successful SMS
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: message.sid,
        userId: 'system',
        details: `Sent SMS to ${options.to}`,
        status: 'success'
      });

      logger.info('SMS sent successfully:', {
        messageId: message.sid,
        to: options.to
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending SMS:', error);

      // Log failed SMS
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: 'failed',
        userId: 'system',
        details: `Failed to send SMS to ${options.to}: ${errorMessage}`,
        status: 'error'
      });

      throw new Error(`Failed to send SMS: ${errorMessage}`);
    }
  }

  async sendTemplatedSMS(
    template: string,
    options: Omit<SMSOptions, 'message'> & {
      variables: Record<string, string>;
    }
  ): Promise<void> {
    try {
      // Process template with variables
      let message = template;
      Object.entries(options.variables).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      await this.sendSMS({
        ...options,
        message
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending templated SMS:', error);
      throw new Error(`Failed to send templated SMS: ${errorMessage}`);
    }
  }

  async verifyNumber(phoneNumber: string): Promise<boolean> {
    try {
      const lookup = await this.client.lookups.v2.phoneNumbers(phoneNumber).fetch();
      return lookup.valid;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error verifying phone number:', error);
      return false;
    }
  }

  async getMessageStatus(messageId: string): Promise<string> {
    try {
      const message = await this.client.messages(messageId).fetch();
      return message.status;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting message status:', error);
      throw new Error(`Failed to get message status: ${errorMessage}`);
    }
  }
} 
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';
import { SMSService } from './sms.service';
import { PushNotificationService } from './push-notification.service';
import { NotificationQueueService } from './notification-queue.service';
import { AuditAction, EntityType } from '../types/audit';
import { NotificationRetryService } from './notification-retry.service';
import { I18nService } from './i18n.service';
import { Notification, NotificationTemplate, NotificationType, NotificationPriority, NotificationFilters, NotificationResult } from '../types/notification';
import { compile } from 'handlebars';
import { emailConfig } from '../config/email.config';
import { smsConfig } from '../config/sms.config';
import { pushNotificationConfig } from '../config/push-notification.config';
import { queueConfig } from '../config/queue.config';

export interface NotificationOptions {
  type: NotificationType;
  subject: string;
  content: string;
  recipient: string;
  metadata?: Record<string, any>;
  priority?: NotificationPriority;
}

export class NotificationService {
  private static instance: NotificationService;

  private notifications: Map<string, Notification>;
  private templates: Map<string, NotificationTemplate>;
  private emailService: EmailService;
  private smsService: SMSService;
  private pushService: PushNotificationService;
  private queueService: NotificationQueueService;
  private auditService: AuditService;
  private retryService: NotificationRetryService;
  private i18nService: I18nService;

  private constructor() {
    this.notifications = new Map();
    this.templates = new Map();
    this.emailService = new EmailService(emailConfig);
    this.smsService = new SMSService(smsConfig);
    this.pushService = new PushNotificationService(pushNotificationConfig);
    this.auditService = AuditService.getInstance();
    this.queueService = new NotificationQueueService(queueConfig, this);
    this.retryService = new NotificationRetryService(queueConfig);
    this.i18nService = new I18nService('pt-BR');
    this.initializeTemplates();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'welcome',
        type: NotificationType.WELCOME,
        subject: 'Bem-vindo ao ControlAI Vendas',
        content: `
          <h1>Bem-vindo ao ControlAI Vendas!</h1>
          <p>Olá {{userName}},</p>
          <p>Obrigado por se cadastrar em nossa plataforma. Estamos muito felizes em tê-lo conosco!</p>
          <p>Para começar a usar o sistema, por favor verifique seu email clicando no botão abaixo:</p>
          <a href="{{verificationUrl}}" class="button">Verificar Email</a>
          <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
          <p>{{verificationUrl}}</p>
          <p>Este link expirará em 24 horas.</p>
          <p>Se você tiver alguma dúvida, não hesite em nos contatar.</p>
          <p>Atenciosamente,<br>Equipe ControlAI Vendas</p>
        `,
        variables: ['userName', 'verificationUrl'],
        priority: NotificationPriority.NORMAL
      },
      {
        id: 'password_reset',
        type: NotificationType.PASSWORD_RESET,
        subject: 'Recuperação de Senha',
        content: `
          <h1>Recuperação de Senha</h1>
          <p>Olá {{userName}},</p>
          <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
          <a href="{{resetUrl}}" class="button">Redefinir Senha</a>
          <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
          <p>{{resetUrl}}</p>
          <p>Este link expirará em 10 minutos.</p>
          <p>Se você não solicitou a recuperação de senha, por favor ignore este email.</p>
          <p>Atenciosamente,<br>Equipe ControlAI Vendas</p>
        `,
        variables: ['userName', 'resetUrl'],
        priority: NotificationPriority.HIGH
      },
      {
        id: 'email_verification',
        type: NotificationType.EMAIL_VERIFICATION,
        subject: 'Verifique seu Email',
        content: `
          <h1>Verificação de Email</h1>
          <p>Olá {{userName}},</p>
          <p>Por favor, verifique seu email clicando no botão abaixo:</p>
          <a href="{{verificationUrl}}" class="button">Verificar Email</a>
          <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
          <p>{{verificationUrl}}</p>
          <p>Este link expirará em 24 horas.</p>
          <p>Se você não solicitou esta verificação, por favor ignore este email.</p>
          <p>Atenciosamente,<br>Equipe ControlAI Vendas</p>
        `,
        variables: ['userName', 'verificationUrl'],
        priority: NotificationPriority.NORMAL
      },
      {
        id: 'account_locked',
        type: NotificationType.SECURITY_ALERT,
        subject: 'Conta Bloqueada',
        content: `
          <h1>Conta Bloqueada</h1>
          <p>Olá {{userName}},</p>
          <p>Sua conta foi bloqueada devido a múltiplas tentativas de login inválidas.</p>
          <p>Para desbloquear sua conta, clique no botão abaixo:</p>
          <a href="{{unlockUrl}}" class="button">Desbloquear Conta</a>
          <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
          <p>{{unlockUrl}}</p>
          <p>Este link expirará em 1 hora.</p>
          <p>Se você não tentou fazer login recentemente, por favor entre em contato conosco imediatamente.</p>
          <p>Atenciosamente,<br>Equipe ControlAI Vendas</p>
        `,
        variables: ['userName', 'unlockUrl'],
        priority: NotificationPriority.HIGH
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  public async createNotification(options: NotificationOptions): Promise<void> {
    const notification: Notification = {
      id: uuidv4(),
      type: options.type,
      subject: options.subject,
      content: options.content,
      recipient: options.recipient,
      metadata: options.metadata,
      priority: options.priority || NotificationPriority.NORMAL,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.sendNotification(notification);
  }

  private async sendNotification(notification: Notification): Promise<void> {
    try {
      switch (notification.type) {
        case NotificationType.EMAIL_VERIFICATION:
        case NotificationType.PASSWORD_RESET:
        case NotificationType.WELCOME:
          await this.emailService.sendEmail({
            to: notification.recipient,
            subject: notification.subject,
            html: notification.content
          });
          break;

        case NotificationType.SECURITY_ALERT:
        case NotificationType.SYSTEM_ALERT:
          await this.pushService.sendNotification({
            to: notification.recipient,
            title: notification.subject,
            body: notification.content,
            data: notification.metadata
          });
          break;

        default:
          await this.storeInAppNotification(notification);
      }

      await this.auditService.logEvent({
        userId: notification.metadata?.userId || 'system',
        action: 'NOTIFICATION_SENT',
        success: true,
        metadata: {
          notificationId: notification.id,
          type: notification.type,
          recipient: notification.recipient
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.retryService.addToRetryQueue(notification, errorMessage);
      
      await this.auditService.logEvent({
        userId: notification.metadata?.userId || 'system',
        action: 'NOTIFICATION_FAILED',
        success: false,
        metadata: {
          notificationId: notification.id,
          type: notification.type,
          recipient: notification.recipient,
          error: errorMessage
        }
      });

      throw error;
    }
  }

  private async storeInAppNotification(notification: Notification): Promise<void> {
    this.notifications.set(notification.id, notification);
    logger.info('Storing in-app notification:', notification);
  }

  public async getNotifications(filters: NotificationFilters): Promise<NotificationResult> {
    try {
      let notifications = Array.from(this.notifications.values());

      if (filters.type) {
        notifications = notifications.filter(n => n.type === filters.type);
      }
      if (filters.priority) {
        notifications = notifications.filter(n => n.priority === filters.priority);
      }
      if (filters.read !== undefined) {
        notifications = notifications.filter(n => n.read === filters.read);
      }
      if (filters.recipient) {
        notifications = notifications.filter(n => n.recipient === filters.recipient);
      }
      if (filters.startDate) {
        notifications = notifications.filter(n => n.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        notifications = notifications.filter(n => n.createdAt <= filters.endDate!);
      }

      return {
        notifications,
        total: notifications.length,
        page: 1,
        limit: notifications.length
      };
    } catch (error) {
      logger.error('Error getting notifications:', error);
      throw error;
    }
  }

  public async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      notification.updatedAt = new Date();
      this.notifications.set(notificationId, notification);
    }
  }

  public async deleteNotification(notificationId: string): Promise<void> {
    this.notifications.delete(notificationId);
  }

  public async getTemplate(templateId: string): Promise<NotificationTemplate | undefined> {
    return this.templates.get(templateId);
  }

  public async processTemplate(templateId: string, variables: Record<string, string>): Promise<string> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const compiledTemplate = compile(template.content);
    return compiledTemplate(variables);
  }
} 
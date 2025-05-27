export enum NotificationType {
  WELCOME = 'WELCOME',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SECURITY_ALERT = 'SECURITY_ALERT',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  IN_APP = 'IN_APP'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Notification {
  id: string;
  type: NotificationType;
  subject: string;
  content: string;
  recipient: string;
  metadata?: Record<string, any>;
  priority: NotificationPriority;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  subject: string;
  content: string;
  variables: string[];
  priority: NotificationPriority;
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  read?: boolean;
  recipient?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface NotificationResult {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface EmailNotificationOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface PushNotificationOptions {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export interface SMSNotificationOptions {
  to: string;
  message: string;
  from?: string;
}

export interface NotificationRetryOptions {
  notification: Notification;
  error: string;
  retryCount: number;
  nextRetryAt: Date;
} 
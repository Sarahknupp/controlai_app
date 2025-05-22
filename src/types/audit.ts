export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'login'
  | 'logout'
  | 'export'
  | 'import';

export type EntityType = 
  | 'customer'
  | 'user'
  | 'settings'
  | 'audit'
  | 'product'
  | 'order';

export type AuditStatus = 'success' | 'error' | 'warning' | 'info';

export interface CreateAuditLogDto {
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  details?: Record<string, any>;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditStatus;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  status?: AuditStatus;
}

export interface AuditLogWithDetails extends Omit<AuditLog, 'details'> {
  details: Record<string, any>;
}

export interface AuditFilters {
  startDate?: string;
  endDate?: string;
  entityType?: EntityType;
  search?: string;
  page?: number;
  pageSize?: number;
  status?: AuditStatus;
}

export interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ip: string;
}

export interface RetentionStats {
  totalLogs: number;
  logsToDelete: number;
  totalSize: number;
  sizeToDelete: number;
}

export interface ArchiveStatus {
  lastArchiveDate: string;
  archiveSize: number;
  archiveLocation: string;
}

export interface AuditSummary {
  totalActions: number;
  uniqueUsers: number;
  mostActiveUser: string;
  mostCommonAction: AuditAction;
  errorCount: number;
  successRate: number;
}

export interface AuditTimelineItem {
  timestamp: string;
  action: AuditAction;
  entityType: EntityType;
  userName: string;
  status: AuditStatus;
}

export interface AuditHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  lastCheck: string;
  retentionStatus: {
    currentSize: number;
    maxSize: number;
    percentageUsed: number;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

export interface AuditStats {
  totalLogs: number;
  activeUsers: number;
  modifiedEntities: number;
  errorRate: number;
  actionDistribution: Array<{
    action: AuditAction;
    count: number;
  }>;
  entityDistribution: Array<{
    entityType: EntityType;
    count: number;
  }>;
  userActivity: Array<{
    userName: string;
    count: number;
  }>;
  activityTrend: Array<{
    date: string;
    count: number;
  }>;
}

export interface AuditExportOptions {
  format: 'csv' | 'json';
  includeDetails?: boolean;
  dateFormat?: string;
  timezone?: string;
  fields?: Array<keyof AuditLog>;
}

export interface AuditRetentionPolicy {
  duration: number; // in days
  maxSize: number; // in bytes
  enabled: boolean;
  archiveEnabled: boolean;
  archiveLocation?: string;
  compressionEnabled?: boolean;
}

export interface AuditArchiveConfig {
  location: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey?: string;
  maxArchiveSize: number;
  archiveRetentionDays: number;
}

export interface AuditNotificationConfig {
  enabled: boolean;
  notifyOnError: boolean;
  notifyOnWarning: boolean;
  notifyOnCritical: boolean;
  recipients: string[];
  notificationChannels: Array<'email' | 'slack' | 'webhook'>;
  webhookUrl?: string;
  slackChannel?: string;
}

export interface AuditSecurityConfig {
  encryptionEnabled: boolean;
  encryptionKey?: string;
  maskSensitiveData: boolean;
  sensitiveFields: string[];
  ipMaskingEnabled: boolean;
  userAgentMaskingEnabled: boolean;
  retentionPolicy: AuditRetentionPolicy;
  archiveConfig: AuditArchiveConfig;
  notificationConfig: AuditNotificationConfig;
} 
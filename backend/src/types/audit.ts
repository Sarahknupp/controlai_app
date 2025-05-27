export enum EntityType {
  USER = 'USER',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  CUSTOMER = 'CUSTOMER',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  INVENTORY = 'INVENTORY',
  STOCK_MOVEMENT = 'STOCK_MOVEMENT',
  REPORT = 'REPORT',
  SCHEDULED_REPORT = 'SCHEDULED_REPORT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  SYNC = 'SYNC',
  VALIDATION = 'VALIDATION',
  BACKUP = 'BACKUP',
  METRICS = 'METRICS',
  NOTIFICATION = 'NOTIFICATION',
  SYSTEM = 'SYSTEM',
  SETTINGS = 'SETTINGS',
  AUDIT = 'AUDIT',
  EMAIL = 'EMAIL'
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  ROLE_CHANGE = 'ROLE_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  API_ACCESS = 'API_ACCESS',
  DATA_ACCESS = 'DATA_ACCESS',
  SECURITY = 'SECURITY'
}

export enum AuditEntityType {
  USER = 'USER',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  API = 'API',
  DATA = 'DATA',
  SYSTEM = 'SYSTEM'
}

export type AuditStatus = 'success' | 'error' | 'warning' | 'info';

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadata: Record<string, any>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export interface CreateAuditLogDto {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, any>;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  status: AuditStatus;
}

export interface AuditFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  ip?: string;
}

export interface AuditResult {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditStats {
  total: number;
  byAction: Record<AuditAction, number>;
  byEntityType: Record<EntityType, number>;
  byStatus: Record<AuditStatus, number>;
  byUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  byDate: Array<{
    date: string;
    count: number;
  }>;
}

export interface AuditLogData {
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  details: string;
  status: 'success' | 'error';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
} 
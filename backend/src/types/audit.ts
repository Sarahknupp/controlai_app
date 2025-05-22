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
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT'
}

export type AuditStatus = 'success' | 'error' | 'warning' | 'info';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  userId: string;
  details: string;
  status: 'success' | 'failure';
  createdAt: Date;
  metadata?: Record<string, unknown>;
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

export interface AuditFilter {
  action?: AuditAction;
  entityType?: EntityType;
  entityId?: string;
  userId?: string;
  status?: AuditStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
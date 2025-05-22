import { AuditLog, AuditAction, EntityType } from '../types/audit';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AuditService {
  private auditLogs: Map<string, AuditLog>;

  constructor() {
    this.auditLogs = new Map();
  }

  async logAction(data: {
    action: AuditAction;
    entityType: EntityType;
    entityId: string;
    userId: string;
    details: string;
    status?: 'success' | 'error';
    metadata?: Record<string, any>;
  }): Promise<AuditLog> {
    try {
      const auditLog: AuditLog = {
        id: uuidv4(),
        timestamp: new Date(),
        ...data,
        status: data.status || 'success',
        metadata: data.metadata || {}
      };

      this.auditLogs.set(auditLog.id, auditLog);
      logger.info('Audit log created:', auditLog);

      return auditLog;
    } catch (error) {
      logger.error('Error creating audit log:', error);
      throw error;
    }
  }

  async getAuditLogs(filters: {
    action?: AuditAction;
    entityType?: EntityType;
    entityId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: 'success' | 'error';
  }, page: number = 1, limit: number = 10): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      let logs = Array.from(this.auditLogs.values());

      // Apply filters
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.entityType) {
        logs = logs.filter(log => log.entityType === filters.entityType);
      }
      if (filters.entityId) {
        logs = logs.filter(log => log.entityId === filters.entityId);
      }
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.status) {
        logs = logs.filter(log => log.status === filters.status);
      }

      // Sort by timestamp in descending order
      logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const total = logs.length;
      const paginatedLogs = logs.slice((page - 1) * limit, page * limit);

      return {
        logs: paginatedLogs,
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error retrieving audit logs:', error);
      throw error;
    }
  }

  async getAuditLog(id: string): Promise<AuditLog | undefined> {
    try {
      return this.auditLogs.get(id);
    } catch (error) {
      logger.error('Error retrieving audit log:', error);
      throw error;
    }
  }

  async getEntityAuditLogs(
    entityType: EntityType,
    entityId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      let logs = Array.from(this.auditLogs.values())
        .filter(log => log.entityType === entityType && log.entityId === entityId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const total = logs.length;
      const paginatedLogs = logs.slice((page - 1) * limit, page * limit);

      return {
        logs: paginatedLogs,
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error retrieving entity audit logs:', error);
      throw error;
    }
  }

  async getUserAuditLogs(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      let logs = Array.from(this.auditLogs.values())
        .filter(log => log.userId === userId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const total = logs.length;
      const paginatedLogs = logs.slice((page - 1) * limit, page * limit);

      return {
        logs: paginatedLogs,
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error retrieving user audit logs:', error);
      throw error;
    }
  }

  async deleteAuditLog(id: string): Promise<void> {
    try {
      const log = this.auditLogs.get(id);
      if (!log) {
        throw new Error(`Audit log not found: ${id}`);
      }

      this.auditLogs.delete(id);
      logger.info('Audit log deleted:', id);
    } catch (error) {
      logger.error('Error deleting audit log:', error);
      throw error;
    }
  }

  async clearAuditLogs(beforeDate: Date): Promise<void> {
    try {
      const logsToDelete = Array.from(this.auditLogs.values())
        .filter(log => log.timestamp < beforeDate);

      logsToDelete.forEach(log => {
        this.auditLogs.delete(log.id);
      });

      logger.info(`Cleared ${logsToDelete.length} audit logs before ${beforeDate}`);
    } catch (error) {
      logger.error('Error clearing audit logs:', error);
      throw error;
    }
  }
} 
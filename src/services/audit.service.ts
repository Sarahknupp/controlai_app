import {
  AuditLog,
  AuditFilters,
  AuditResponse,
  RetentionStats,
  ArchiveStatus,
  AuditStats,
  AuditAction,
  EntityType,
  AuditStatus,
  AuditLogWithDetails,
  CreateAuditLogDto,
  AuditSummary,
  AuditTimelineItem,
  AuditHealth,
  AuditExportOptions,
  AuditRetentionPolicy,
  AuditArchiveConfig,
  AuditNotificationConfig,
  AuditSecurityConfig
} from '../types/audit';
import { handleError } from '../utils/error';
import BaseService from './base.service';
import { cacheService } from './cache.service';
import {
  formatAuditDetails,
  parseAuditDetails,
  validateAuditLog,
  generateAuditCacheKey,
  getDefaultAuditFilters
} from '../utils/audit.utils';

export interface AuditSearchParams extends Partial<AuditFilters> {
  entityId?: string;
  action?: AuditAction;
  userId?: string;
}

export interface AuditExportParams extends Omit<AuditSearchParams, 'page' | 'pageSize'> {
  format?: 'csv' | 'json';
}

class AuditService extends BaseService {
  private readonly basePath = '/audit';

  async createLog(log: CreateAuditLogDto): Promise<AuditLogWithDetails> {
    try {
      const errors = validateAuditLog(log);
      if (errors.length > 0) {
        throw new Error(`Invalid audit log: ${errors.join(', ')}`);
      }

      const auditLog = {
        ...log,
        details: log.details ? formatAuditDetails(log.details) : '',
        createdAt: new Date().toISOString()
      };

      const response = await this.post(`${this.basePath}/logs`, auditLog);
      return {
        ...response,
        details: response.details ? parseAuditDetails(response.details) : {}
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogs(params?: AuditSearchParams): Promise<AuditResponse> {
    try {
      const searchParams = { ...getDefaultAuditFilters(), ...params };
      const stringParams: Record<string, string> = {};
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) {
          stringParams[key] = value.toString();
        }
      });

      const cacheKey = generateAuditCacheKey(searchParams);
      const response = await this.get(`${this.basePath}/logs`, stringParams, { useCache: true, cacheKey });

      return {
        ...response,
        logs: response.logs.map((log: AuditLog) => ({
          ...log,
          details: log.details || ''
        }))
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogById(id: string): Promise<AuditLogWithDetails> {
    try {
      const cacheKey = generateAuditCacheKey({ entityId: id });
      const response = await this.get(`${this.basePath}/logs/${id}`, undefined, { useCache: true, cacheKey });
      
      return {
        ...response,
        details: response.details ? parseAuditDetails(response.details) : {}
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async exportLogs(params?: AuditExportParams, options?: AuditExportOptions): Promise<void> {
    try {
      const queryString = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
      const format = options?.format || params?.format || 'csv';
      const filename = `audit-logs-${new Date().toISOString()}.${format}`;
      
      await this.download(`${this.basePath}/logs/export${queryString}`, filename, {
        body: options
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getStats(params?: Pick<AuditSearchParams, 'startDate' | 'endDate' | 'entityType'>): Promise<AuditStats> {
    try {
      const cacheKey = generateAuditCacheKey(params || {});
      return this.get(`${this.basePath}/stats`, params, { useCache: true, cacheKey });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getRetentionStats(): Promise<RetentionStats> {
    try {
      const cacheKey = generateAuditCacheKey({});
      return this.get(`${this.basePath}/retention/stats`, undefined, { useCache: true, cacheKey });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getArchiveStatus(): Promise<ArchiveStatus> {
    try {
      const cacheKey = generateAuditCacheKey({});
      return this.get(`${this.basePath}/archive/status`, undefined, { useCache: true, cacheKey });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async applyRetentionPolicy(policy: {
    duration?: number;
    maxSize?: number;
    enabled?: boolean;
  }): Promise<RetentionStats> {
    try {
      return this.post(`${this.basePath}/retention`, policy);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async archiveLogs(): Promise<void> {
    try {
      await this.post(`${this.basePath}/archive`, {});
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async logAction(
    action: AuditAction,
    entityType: EntityType,
    entityId: string,
    details?: Record<string, any>,
    status?: AuditStatus
  ): Promise<AuditLogWithDetails> {
    try {
      return this.createLog({
        action,
        entityType,
        entityId,
        details,
        status
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async searchLogs(query: string): Promise<AuditLogWithDetails[]> {
    try {
      const response = await this.get(`${this.basePath}/logs/search`, { query });
      return response.map((log: AuditLog) => ({
        ...log,
        details: log.details ? parseAuditDetails(log.details) : {}
      }));
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogsByUser(userId: string, params?: Omit<AuditSearchParams, 'userId'>): Promise<AuditResponse> {
    try {
      return this.getLogs({ ...params, userId });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogsByEntity(entityType: EntityType, entityId: string, params?: Omit<AuditSearchParams, 'entityType' | 'entityId'>): Promise<AuditResponse> {
    try {
      return this.getLogs({ ...params, entityType, entityId });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogsByAction(action: AuditAction, params?: Omit<AuditSearchParams, 'action'>): Promise<AuditResponse> {
    try {
      return this.getLogs({ ...params, action });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogsByDateRange(startDate: string, endDate: string, params?: Omit<AuditSearchParams, 'startDate' | 'endDate'>): Promise<AuditResponse> {
    try {
      return this.getLogs({ ...params, startDate, endDate });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getRecentLogs(limit: number = 10): Promise<AuditLogWithDetails[]> {
    try {
      const response = await this.get(`${this.basePath}/logs/recent`, { limit: limit.toString() });
      return response.map((log: AuditLog) => ({
        ...log,
        details: log.details ? parseAuditDetails(log.details) : {}
      }));
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogsWithDetails(params?: AuditSearchParams): Promise<AuditLogWithDetails[]> {
    try {
      const response = await this.getLogs(params);
      return response.logs.map(log => ({
        ...log,
        details: log.details ? parseAuditDetails(log.details) : {}
      }));
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  // New utility methods for common queries
  async getTodayLogs(params?: Omit<AuditSearchParams, 'startDate' | 'endDate'>): Promise<AuditResponse> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return this.getLogsByDateRange(
        today.toISOString(),
        tomorrow.toISOString(),
        params
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLastWeekLogs(params?: Omit<AuditSearchParams, 'startDate' | 'endDate'>): Promise<AuditResponse> {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);

      return this.getLogsByDateRange(
        start.toISOString(),
        end.toISOString(),
        params
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLastMonthLogs(params?: Omit<AuditSearchParams, 'startDate' | 'endDate'>): Promise<AuditResponse> {
    try {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);

      return this.getLogsByDateRange(
        start.toISOString(),
        end.toISOString(),
        params
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogsByStatus(status: AuditStatus, params?: Omit<AuditSearchParams, 'status'>): Promise<AuditResponse> {
    try {
      return this.getLogs({ ...params, status });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getUserLogsByPeriod(
    userId: string,
    startDate: string,
    endDate: string,
    params?: Omit<AuditSearchParams, 'userId' | 'startDate' | 'endDate'>
  ): Promise<AuditResponse> {
    try {
      return this.getLogs({
        ...params,
        userId,
        startDate,
        endDate
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getEntityLogsByPeriod(
    entityType: EntityType,
    entityId: string,
    startDate: string,
    endDate: string,
    params?: Omit<AuditSearchParams, 'entityType' | 'entityId' | 'startDate' | 'endDate'>
  ): Promise<AuditResponse> {
    try {
      return this.getLogs({
        ...params,
        entityType,
        entityId,
        startDate,
        endDate
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getActionLogsByPeriod(
    action: AuditAction,
    startDate: string,
    endDate: string,
    params?: Omit<AuditSearchParams, 'action' | 'startDate' | 'endDate'>
  ): Promise<AuditResponse> {
    try {
      return this.getLogs({
        ...params,
        action,
        startDate,
        endDate
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogsByUserAndAction(
    userId: string,
    action: AuditAction,
    params?: Omit<AuditSearchParams, 'userId' | 'action'>
  ): Promise<AuditResponse> {
    try {
      return this.getLogs({
        ...params,
        userId,
        action
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogsByEntityAndAction(
    entityType: EntityType,
    entityId: string,
    action: AuditAction,
    params?: Omit<AuditSearchParams, 'entityType' | 'entityId' | 'action'>
  ): Promise<AuditResponse> {
    try {
      return this.getLogs({
        ...params,
        entityType,
        entityId,
        action
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getLogsByUserAndEntity(
    userId: string,
    entityType: EntityType,
    entityId: string,
    params?: Omit<AuditSearchParams, 'userId' | 'entityType' | 'entityId'>
  ): Promise<AuditResponse> {
    try {
      return this.getLogs({
        ...params,
        userId,
        entityType,
        entityId
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async clearAuditCache(): Promise<void> {
    try {
      const cacheKeys = [
        generateAuditCacheKey({}),
        generateAuditCacheKey({ entityType: 'audit' }),
        generateAuditCacheKey({ action: 'view' })
      ];

      await Promise.all(
        cacheKeys.map(key => cacheService.remove(key))
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getAuditSummary(params?: Pick<AuditSearchParams, 'startDate' | 'endDate'>): Promise<AuditSummary> {
    try {
      const response = await this.get(`${this.basePath}/summary`, params);
      return {
        totalActions: response.totalActions,
        uniqueUsers: response.uniqueUsers,
        mostActiveUser: response.mostActiveUser,
        mostCommonAction: response.mostCommonAction,
        errorCount: response.errorCount,
        successRate: response.successRate
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getAuditTimeline(params?: Pick<AuditSearchParams, 'startDate' | 'endDate'>): Promise<AuditTimelineItem[]> {
    try {
      const response = await this.get(`${this.basePath}/timeline`, params);
      return response.map((item: any) => ({
        timestamp: item.timestamp,
        action: item.action,
        entityType: item.entityType,
        userName: item.userName,
        status: item.status
      }));
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getAuditHealth(): Promise<AuditHealth> {
    try {
      const response = await this.get(`${this.basePath}/health`);
      return {
        status: response.status,
        issues: response.issues,
        lastCheck: response.lastCheck,
        retentionStatus: {
          currentSize: response.retentionStatus.currentSize,
          maxSize: response.retentionStatus.maxSize,
          percentageUsed: response.retentionStatus.percentageUsed
        },
        performance: {
          averageResponseTime: response.performance.averageResponseTime,
          errorRate: response.performance.errorRate,
          cacheHitRate: response.performance.cacheHitRate
        }
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getSecurityConfig(): Promise<AuditSecurityConfig> {
    try {
      return this.get(`${this.basePath}/security/config`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async updateSecurityConfig(config: Partial<AuditSecurityConfig>): Promise<AuditSecurityConfig> {
    try {
      return this.put(`${this.basePath}/security/config`, config);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getRetentionPolicy(): Promise<AuditRetentionPolicy> {
    try {
      return this.get(`${this.basePath}/retention/policy`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async updateRetentionPolicy(policy: Partial<AuditRetentionPolicy>): Promise<AuditRetentionPolicy> {
    try {
      return this.put(`${this.basePath}/retention/policy`, policy);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getArchiveConfig(): Promise<AuditArchiveConfig> {
    try {
      return this.get(`${this.basePath}/archive/config`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async updateArchiveConfig(config: Partial<AuditArchiveConfig>): Promise<AuditArchiveConfig> {
    try {
      return this.put(`${this.basePath}/archive/config`, config);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getNotificationConfig(): Promise<AuditNotificationConfig> {
    try {
      return this.get(`${this.basePath}/notifications/config`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async updateNotificationConfig(config: Partial<AuditNotificationConfig>): Promise<AuditNotificationConfig> {
    try {
      return this.put(`${this.basePath}/notifications/config`, config);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async testNotificationConfig(): Promise<{ success: boolean; message: string }> {
    try {
      return this.post(`${this.basePath}/notifications/test`, {});
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}

export const auditService = new AuditService(); 
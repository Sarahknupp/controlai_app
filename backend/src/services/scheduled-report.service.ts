import { AuditService } from './audit.service';
import { EntityType, AuditAction } from '../types/audit';
import { NotificationService } from './notification.service';
import { ReportService } from './report.service';
import { ExportService } from './export.service';
import { EventEmitter } from 'events';
import logger from '../utils/logger';
import * as cron from 'node-cron';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream/promises';

export enum ReportSchedule {
  DAILY = '0 0 * * *',
  WEEKLY = '0 0 * * 0',
  MONTHLY = '0 0 1 * *',
  QUARTERLY = '0 0 1 */3 *',
  YEARLY = '0 0 1 1 *'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'xlsx',
  CSV = 'csv'
}

interface ScheduledReportOptions {
  name: string;
  type: string;
  format: ReportFormat;
  schedule: string;
  recipients: string[];
  filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    [key: string]: any;
  };
  options?: {
    includeCharts?: boolean;
    includeSummary?: boolean;
    compression?: boolean;
    customFields?: string[];
  };
  userId?: string;
}

interface ScheduledReport {
  reportId: string;
  name: string;
  type: string;
  format: ReportFormat;
  schedule: string;
  recipients: string[];
  filters?: Record<string, any>;
  options?: Record<string, any>;
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'paused' | 'deleted';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ScheduledReportService extends EventEmitter {
  private auditService: AuditService;
  private notificationService: NotificationService;
  private reportService: ReportService;
  private exportService: ExportService;
  private scheduledTasks: Map<string, cron.ScheduledTask>;
  private reportsDir: string;

  constructor() {
    super();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.reportService = new ReportService();
    this.exportService = new ExportService();
    this.scheduledTasks = new Map();
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.ensureReportsDirectory();
  }

  private ensureReportsDirectory(): void {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async scheduleReport(options: ScheduledReportOptions): Promise<ScheduledReport> {
    const timestamp = new Date();
    const reportId = `report_${options.type}_${timestamp.getTime()}`;

    try {
      // Validate cron expression
      if (!cron.validate(options.schedule)) {
        throw new Error('Invalid cron expression');
      }

      // Create scheduled report record
      const report: ScheduledReport = {
        reportId,
        name: options.name,
        type: options.type,
        format: options.format,
        schedule: options.schedule,
        recipients: options.recipients,
        filters: options.filters,
        options: options.options,
        status: 'active',
        createdBy: options.userId,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Schedule the report
      const task = cron.schedule(options.schedule, async () => {
        try {
          await this.generateAndSendReport(report);
        } catch (error) {
          logger.error('Error generating scheduled report:', error);
        }
      });

      this.scheduledTasks.set(reportId, task);

      // Log the action
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.REPORT,
        entityId: reportId,
        userId: options.userId,
        details: `Scheduled ${options.type} report: ${options.name}`,
        status: 'success'
      });

      // Send notification
      await this.notificationService.sendNotification({
        type: 'SYSTEM',
        priority: 'MEDIUM',
        title: 'Report Scheduled',
        message: `Successfully scheduled ${options.type} report: ${options.name}`,
        metadata: {
          reportId,
          name: options.name,
          type: options.type,
          schedule: options.schedule,
          timestamp: timestamp.toISOString()
        }
      });

      return report;
    } catch (error) {
      logger.error('Error scheduling report:', error);

      // Log failure
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.REPORT,
        entityId: reportId,
        userId: options.userId,
        details: `Failed to schedule report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error'
      });

      // Send failure notification
      await this.notificationService.sendNotification({
        type: 'ERROR',
        priority: 'HIGH',
        title: 'Report Scheduling Failed',
        message: `Failed to schedule ${options.type} report: ${options.name}`,
        metadata: {
          reportId,
          name: options.name,
          type: options.type,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: timestamp.toISOString()
        }
      });

      throw error;
    }
  }

  private async generateAndSendReport(report: ScheduledReport): Promise<void> {
    try {
      // Generate report
      const reportData = await this.reportService.generateReport({
        type: report.type,
        filters: report.filters,
        options: report.options
      });

      // Export report
      const exportResult = await this.exportService.exportData({
        type: report.type,
        format: report.format,
        filters: report.filters,
        options: {
          ...report.options,
          compression: true
        }
      });

      // Send report to recipients
      for (const recipient of report.recipients) {
        try {
          await this.notificationService.sendNotification({
            type: 'REPORT',
            priority: 'MEDIUM',
            title: `Scheduled Report: ${report.name}`,
            message: `Your scheduled report "${report.name}" is ready for download.`,
            recipient,
            metadata: {
              reportId: report.reportId,
              name: report.name,
              type: report.type,
              format: report.format,
              downloadUrl: `/api/reports/${exportResult.exportId}/download`,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error) {
          logger.error(`Error sending report to ${recipient}:`, error);
        }
      }

      // Update last run time
      report.lastRun = new Date();
      report.nextRun = this.calculateNextRun(report.schedule);

      // Log success
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.REPORT,
        entityId: report.reportId,
        userId: report.createdBy,
        details: `Generated and sent scheduled report: ${report.name}`,
        status: 'success'
      });
    } catch (error) {
      logger.error('Error generating and sending report:', error);

      // Log failure
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.REPORT,
        entityId: report.reportId,
        userId: report.createdBy,
        details: `Failed to generate and send report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error'
      });

      // Send failure notification
      await this.notificationService.sendNotification({
        type: 'ERROR',
        priority: 'HIGH',
        title: 'Report Generation Failed',
        message: `Failed to generate scheduled report: ${report.name}`,
        metadata: {
          reportId: report.reportId,
          name: report.name,
          type: report.type,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });

      throw error;
    }
  }

  private calculateNextRun(schedule: string): Date {
    const nextRun = cron.schedule(schedule, () => {}).nextDate();
    return nextRun;
  }

  async cancelScheduledReport(reportId: string, userId?: string): Promise<void> {
    const task = this.scheduledTasks.get(reportId);
    if (task) {
      task.stop();
      this.scheduledTasks.delete(reportId);

      // Log cancellation
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.REPORT,
        entityId: reportId,
        userId,
        details: 'Cancelled scheduled report',
        status: 'success'
      });

      // Send notification
      await this.notificationService.sendNotification({
        type: 'SYSTEM',
        priority: 'MEDIUM',
        title: 'Report Cancelled',
        message: 'Successfully cancelled scheduled report',
        metadata: {
          reportId,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  async getScheduledReports(): Promise<ScheduledReport[]> {
    // TODO: Implement retrieval of scheduled reports from database
    return [];
  }
} 
import { Sale } from '../models/sale.model';
import { Product } from '../models/product.model';
import { Customer } from '../models/customer.model';
import { User } from '../models/user.model';
import { AuditService } from './audit.service';
import { EntityType, AuditAction } from '../types/audit';
import { NotificationService } from './notification.service';
import { EventEmitter } from 'events';
import logger from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { createObjectCsvWriter } from 'csv-writer';
import { promisify } from 'util';
import { pipeline } from 'stream/promises';

export enum ExportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'xlsx',
  JSON = 'json'
}

interface ExportOptions {
  type: string;
  format: ExportFormat;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    [key: string]: any;
  };
  userId?: string;
  options?: {
    batchSize?: number;
    includeHeaders?: boolean;
    compression?: boolean;
    customFields?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

interface ExportResult {
  exportId: string;
  type: string;
  format: ExportFormat;
  timestamp: Date;
  status: ExportStatus;
  filePath?: string;
  details: {
    totalRecords: number;
    processedRecords: number;
    exportedRecords: number;
    failedRecords: number;
    errors: Array<{
      recordId: string;
      error: string;
    }>;
  };
}

export class ExportService extends EventEmitter {
  private auditService: AuditService;
  private notificationService: NotificationService;
  private exportDir: string;
  private defaultOptions = {
    batchSize: 1000,
    includeHeaders: true,
    compression: false,
    customFields: [],
    sortBy: 'createdAt',
    sortOrder: 'desc' as const
  };

  constructor() {
    super();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.exportDir = path.join(process.cwd(), 'exports');
    this.ensureExportDirectory();
  }

  private ensureExportDirectory(): void {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  async exportData(options: ExportOptions): Promise<ExportResult> {
    const timestamp = new Date();
    const exportId = `export_${options.type}_${timestamp.getTime()}`;
    const exportOptions = { ...this.defaultOptions, ...options.options };

    try {
      // Log the export start
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.EXPORT,
        entityId: exportId,
        userId: options.userId,
        details: `Started ${options.type} export to ${options.format}`,
        status: 'success'
      });

      // Send notification
      await this.notificationService.sendNotification({
        type: 'SYSTEM',
        priority: 'MEDIUM',
        title: 'Export Started',
        message: `Started ${options.type} export to ${options.format}`,
        metadata: {
          exportId,
          type: options.type,
          format: options.format,
          timestamp: timestamp.toISOString()
        }
      });

      // Perform export
      const result = await this.performExport(options, exportId, exportOptions);

      // Log success
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.EXPORT,
        entityId: exportId,
        userId: options.userId,
        details: `Completed ${options.type} export to ${options.format}`,
        status: 'success'
      });

      // Send success notification
      await this.notificationService.sendNotification({
        type: 'SUCCESS',
        priority: 'MEDIUM',
        title: 'Export Completed',
        message: `Successfully completed ${options.type} export to ${options.format}`,
        metadata: {
          exportId,
          type: options.type,
          format: options.format,
          timestamp: timestamp.toISOString(),
          details: result.details
        }
      });

      return result;
    } catch (error) {
      logger.error('Error exporting data:', error);

      // Log failure
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.EXPORT,
        entityId: exportId,
        userId: options.userId,
        details: `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error'
      });

      // Send failure notification
      await this.notificationService.sendNotification({
        type: 'ERROR',
        priority: 'HIGH',
        title: 'Export Failed',
        message: `Failed to export ${options.type} data to ${options.format}`,
        metadata: {
          exportId,
          type: options.type,
          format: options.format,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: timestamp.toISOString()
        }
      });

      throw error;
    }
  }

  private async performExport(options: ExportOptions, exportId: string, exportOptions: any): Promise<ExportResult> {
    const timestamp = new Date();
    const errors: Array<{ recordId: string; error: string }> = [];
    let totalRecords = 0;
    let processedRecords = 0;
    let exportedRecords = 0;
    let failedRecords = 0;
    let filePath: string | undefined;

    try {
      // TODO: Implement actual export logic here
      // This would involve:
      // 1. Fetching data based on type and filters
      // 2. Processing data in batches
      // 3. Converting to requested format
      // 4. Writing to file
      // 5. Handling compression if needed
      // 6. Updating progress

      return {
        exportId,
        type: options.type,
        format: options.format,
        timestamp,
        status: ExportStatus.COMPLETED,
        filePath,
        details: {
          totalRecords,
          processedRecords,
          exportedRecords,
          failedRecords,
          errors
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getExportStatus(exportId: string): Promise<ExportResult> {
    // TODO: Implement status check logic
    throw new Error('Not implemented');
  }

  async deleteExport(exportId: string, userId?: string): Promise<void> {
    const filePath = path.join(this.exportDir, `${exportId}.*`);
    const files = fs.readdirSync(this.exportDir).filter(file => file.startsWith(exportId));

    for (const file of files) {
      const fullPath = path.join(this.exportDir, file);
      fs.unlinkSync(fullPath);

      // Log deletion
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.EXPORT,
        entityId: exportId,
        userId,
        details: `Deleted export file: ${file}`,
        status: 'success'
      });
    }

    // Send notification
    await this.notificationService.sendNotification({
      type: 'SYSTEM',
      priority: 'MEDIUM',
      title: 'Export Deleted',
      message: 'Successfully deleted export files',
      metadata: {
        exportId,
        timestamp: new Date().toISOString()
      }
    });
  }
} 
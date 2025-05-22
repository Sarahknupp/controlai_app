import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';
import { EntityType, AuditAction } from '../types/audit';
import logger from '../utils/logger';
import { Sale } from '../models/sale.model';
import { Product } from '../models/product.model';
import { Customer } from '../models/customer.model';
import { User } from '../models/user.model';
import { EventEmitter } from 'events';
import { createWriteStream, createReadStream, mkdirSync, existsSync } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

const execAsync = promisify(exec);

interface BackupOptions {
  type: 'full' | 'incremental';
  userId?: string;
  entities?: Array<'sales' | 'products' | 'customers' | 'users'>;
  compression?: boolean;
}

interface BackupResult {
  backupId: string;
  type: string;
  timestamp: Date;
  status: 'success' | 'error';
  details: {
    entities: string[];
    totalRecords: number;
    backupSize: number;
    filePath: string;
  };
}

export class BackupService extends EventEmitter {
  private auditService: AuditService;
  private notificationService: NotificationService;
  private backupInProgress: boolean;
  private backupsDir: string;

  constructor() {
    super();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.backupInProgress = false;
    this.backupsDir = path.join(process.cwd(), 'backups');

    // Ensure backups directory exists
    if (!existsSync(this.backupsDir)) {
      mkdirSync(this.backupsDir, { recursive: true });
    }
  }

  async createBackup(options: BackupOptions): Promise<BackupResult> {
    if (this.backupInProgress) {
      throw new Error('Backup already in progress');
    }

    const timestamp = new Date();
    const backupId = `backup_${options.type}_${timestamp.getTime()}`;
    const filename = `${options.type}_${timestamp.getTime()}.json${options.compression ? '.gz' : ''}`;
    const filePath = path.join(this.backupsDir, filename);
    this.backupInProgress = true;

    try {
      const result = await this.performBackup(options, filePath);

      // Log the backup
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.BACKUP,
        entityId: backupId,
        userId: options.userId,
        details: `Created ${options.type} backup`,
        status: 'success'
      });

      // Emit backup complete event
      this.emit('backupComplete', {
        type: options.type,
        timestamp,
        result
      });

      // Send notification
      await this.notificationService.sendNotification({
        type: 'SYSTEM',
        priority: 'MEDIUM',
        title: 'Backup Complete',
        message: `Successfully created ${options.type} backup`,
        metadata: {
          backupId,
          type: options.type,
          timestamp: timestamp.toISOString()
        }
      });

      return {
        backupId,
        type: options.type,
        timestamp,
        status: 'success',
        details: result
      };
    } catch (error) {
      logger.error('Error creating backup:', error);

      // Log failure
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.BACKUP,
        entityId: backupId,
        userId: options.userId,
        details: `Failed to create ${options.type} backup: ${error.message}`,
        status: 'error'
      });

      // Send failure notification
      await this.notificationService.sendNotification({
        type: 'ERROR',
        priority: 'HIGH',
        title: 'Backup Failed',
        message: `Failed to create ${options.type} backup`,
        metadata: {
          backupId,
          type: options.type,
          error: error.message,
          timestamp: timestamp.toISOString()
        }
      });

      throw error;
    } finally {
      this.backupInProgress = false;
    }
  }

  private async performBackup(options: BackupOptions, filePath: string): Promise<{
    entities: string[];
    totalRecords: number;
    backupSize: number;
    filePath: string;
  }> {
    const entities = options.entities || ['sales', 'products', 'customers', 'users'];
    const data: Record<string, any[]> = {};
    let totalRecords = 0;

    // Collect data from each entity
    for (const entity of entities) {
      switch (entity) {
        case 'sales':
          data.sales = await Sale.find().populate('customer product user');
          totalRecords += data.sales.length;
          break;
        case 'products':
          data.products = await Product.find();
          totalRecords += data.products.length;
          break;
        case 'customers':
          data.customers = await Customer.find();
          totalRecords += data.customers.length;
          break;
        case 'users':
          data.users = await User.find();
          totalRecords += data.users.length;
          break;
      }
    }

    // Write data to file
    const writeStream = createWriteStream(filePath);
    if (options.compression) {
      await pipeline(
        JSON.stringify(data),
        createGzip(),
        writeStream
      );
    } else {
      await pipeline(
        JSON.stringify(data),
        writeStream
      );
    }

    // Get file size
    const { stdout } = await execAsync(`stat -f %z "${filePath}"`);
    const backupSize = parseInt(stdout.trim());

    return {
      entities,
      totalRecords,
      backupSize,
      filePath
    };
  }

  async restoreBackup(backupId: string, userId?: string): Promise<void> {
    if (this.backupInProgress) {
      throw new Error('Backup operation already in progress');
    }

    this.backupInProgress = true;

    try {
      const filePath = path.join(this.backupsDir, backupId);
      const data = JSON.parse(await this.readBackupFile(filePath));

      // Restore each entity
      for (const [entity, records] of Object.entries(data)) {
        switch (entity) {
          case 'sales':
            await Sale.deleteMany({});
            await Sale.insertMany(records);
            break;
          case 'products':
            await Product.deleteMany({});
            await Product.insertMany(records);
            break;
          case 'customers':
            await Customer.deleteMany({});
            await Customer.insertMany(records);
            break;
          case 'users':
            await User.deleteMany({});
            await User.insertMany(records);
            break;
        }
      }

      // Log the restore
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.BACKUP,
        entityId: backupId,
        userId,
        details: 'Restored data from backup',
        status: 'success'
      });

      // Send notification
      await this.notificationService.sendNotification({
        type: 'SYSTEM',
        priority: 'HIGH',
        title: 'Backup Restore Complete',
        message: 'Successfully restored data from backup',
        metadata: {
          backupId,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error restoring backup:', error);

      // Log failure
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.BACKUP,
        entityId: backupId,
        userId,
        details: `Failed to restore backup: ${error.message}`,
        status: 'error'
      });

      // Send failure notification
      await this.notificationService.sendNotification({
        type: 'ERROR',
        priority: 'HIGH',
        title: 'Backup Restore Failed',
        message: 'Failed to restore data from backup',
        metadata: {
          backupId,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });

      throw error;
    } finally {
      this.backupInProgress = false;
    }
  }

  private async readBackupFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = '';
      const readStream = createReadStream(filePath);
      
      if (filePath.endsWith('.gz')) {
        readStream.pipe(createGzip())
          .on('data', chunk => data += chunk)
          .on('end', () => resolve(data))
          .on('error', reject);
      } else {
        readStream
          .on('data', chunk => data += chunk)
          .on('end', () => resolve(data))
          .on('error', reject);
      }
    });
  }

  async listBackups(): Promise<Array<{
    id: string;
    type: string;
    timestamp: Date;
    size: number;
    entities: string[];
  }>> {
    const { stdout } = await execAsync(`ls -l "${this.backupsDir}"`);
    const files = stdout.split('\n')
      .filter(line => line.trim() && !line.startsWith('total'))
      .map(line => {
        const parts = line.split(/\s+/);
        const filename = parts[parts.length - 1];
        const size = parseInt(parts[4]);
        const match = filename.match(/^(full|incremental)_(\d+)\.json(\.gz)?$/);
        
        if (match) {
          return {
            id: filename,
            type: match[1],
            timestamp: new Date(parseInt(match[2])),
            size,
            entities: [] // Would need to read file to get entities
          };
        }
        return null;
      })
      .filter(Boolean);

    return files;
  }

  async deleteBackup(backupId: string, userId?: string): Promise<void> {
    const filePath = path.join(this.backupsDir, backupId);

    try {
      await execAsync(`rm "${filePath}"`);

      // Log the deletion
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.BACKUP,
        entityId: backupId,
        userId,
        details: 'Deleted backup',
        status: 'success'
      });

      // Send notification
      await this.notificationService.sendNotification({
        type: 'SYSTEM',
        priority: 'MEDIUM',
        title: 'Backup Deleted',
        message: 'Successfully deleted backup',
        metadata: {
          backupId,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error deleting backup:', error);

      // Log failure
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.BACKUP,
        entityId: backupId,
        userId,
        details: `Failed to delete backup: ${error.message}`,
        status: 'error'
      });

      // Send failure notification
      await this.notificationService.sendNotification({
        type: 'ERROR',
        priority: 'HIGH',
        title: 'Backup Deletion Failed',
        message: 'Failed to delete backup',
        metadata: {
          backupId,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });

      throw error;
    }
  }

  isBackupInProgress(): boolean {
    return this.backupInProgress;
  }
} 
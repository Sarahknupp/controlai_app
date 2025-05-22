import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';

export interface SystemSettings {
  id: string;
  key: string;
  value: any;
  description: string;
  category: 'GENERAL' | 'NOTIFICATIONS' | 'PAYMENT' | 'SHIPPING' | 'INVENTORY' | 'REPORTING';
  isPublic: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
    timezone: string;
    theme: 'LIGHT' | 'DARK' | 'SYSTEM';
    currency: string;
    dateFormat: string;
    timeFormat: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class SettingsService {
  private systemSettings: Map<string, SystemSettings>;
  private userPreferences: Map<string, UserPreferences>;
  private auditService: AuditService;

  constructor() {
    this.systemSettings = new Map();
    this.userPreferences = new Map();
    this.auditService = new AuditService();
    this.initializeDefaultSettings();
  }

  private initializeDefaultSettings() {
    const defaultSettings: SystemSettings[] = [
      {
        id: uuidv4(),
        key: 'company_name',
        value: 'ControlAI Vendas',
        description: 'Company name displayed throughout the application',
        category: 'GENERAL',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        key: 'default_currency',
        value: 'BRL',
        description: 'Default currency for the application',
        category: 'GENERAL',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        key: 'low_stock_threshold',
        value: 10,
        description: 'Minimum stock level before triggering low stock alerts',
        category: 'INVENTORY',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        key: 'notification_email_from',
        value: 'noreply@controlaivendas.com',
        description: 'Default sender email address for notifications',
        category: 'NOTIFICATIONS',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        key: 'shipping_carriers',
        value: ['CORREIOS', 'FEDEX', 'DHL', 'UPS', 'LOCAL_DELIVERY'],
        description: 'Available shipping carriers',
        category: 'SHIPPING',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        key: 'payment_methods',
        value: ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PIX', 'BOLETO', 'CASH'],
        description: 'Available payment methods',
        category: 'PAYMENT',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        key: 'report_retention_days',
        value: 365,
        description: 'Number of days to retain generated reports',
        category: 'REPORTING',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultSettings.forEach(setting => {
      this.systemSettings.set(setting.key, setting);
    });
  }

  async getSystemSetting(key: string): Promise<SystemSettings | undefined> {
    return this.systemSettings.get(key);
  }

  async getSystemSettings(
    category?: SystemSettings['category'],
    isPublic?: boolean
  ): Promise<SystemSettings[]> {
    let settings = Array.from(this.systemSettings.values());

    if (category) {
      settings = settings.filter(s => s.category === category);
    }

    if (isPublic !== undefined) {
      settings = settings.filter(s => s.isPublic === isPublic);
    }

    return settings;
  }

  async updateSystemSetting(
    key: string,
    value: any,
    userId: string = 'system'
  ): Promise<SystemSettings> {
    try {
      const setting = this.systemSettings.get(key);
      if (!setting) {
        throw new Error(`Setting not found: ${key}`);
      }

      const previousValue = setting.value;
      setting.value = value;
      setting.updatedAt = new Date();

      this.systemSettings.set(key, setting);

      // Log the update
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.SETTINGS,
        entityId: setting.id,
        userId,
        details: `Updated system setting ${key} from ${JSON.stringify(previousValue)} to ${JSON.stringify(value)}`,
        status: 'success'
      });

      return setting;
    } catch (error) {
      logger.error('Error updating system setting:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return this.userPreferences.get(userId);
  }

  async createUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences['preferences']>
  ): Promise<UserPreferences> {
    try {
      const existingPreferences = this.userPreferences.get(userId);
      if (existingPreferences) {
        throw new Error(`Preferences already exist for user: ${userId}`);
      }

      const defaultPreferences: UserPreferences = {
        id: uuidv4(),
        userId,
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          theme: 'LIGHT',
          currency: 'BRL',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Merge with provided preferences
      const userPreferences: UserPreferences = {
        ...defaultPreferences,
        preferences: {
          ...defaultPreferences.preferences,
          ...preferences
        }
      };

      this.userPreferences.set(userId, userPreferences);

      // Log the creation
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.SETTINGS,
        entityId: userPreferences.id,
        userId,
        details: `Created user preferences for user: ${userId}`,
        status: 'success'
      });

      return userPreferences;
    } catch (error) {
      logger.error('Error creating user preferences:', error);
      throw error;
    }
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences['preferences']>,
    updatedBy: string = 'system'
  ): Promise<UserPreferences> {
    try {
      const existingPreferences = this.userPreferences.get(userId);
      if (!existingPreferences) {
        throw new Error(`Preferences not found for user: ${userId}`);
      }

      const previousPreferences = { ...existingPreferences.preferences };
      existingPreferences.preferences = {
        ...existingPreferences.preferences,
        ...preferences
      };
      existingPreferences.updatedAt = new Date();

      this.userPreferences.set(userId, existingPreferences);

      // Log the update
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.SETTINGS,
        entityId: existingPreferences.id,
        userId: updatedBy,
        details: `Updated user preferences for user: ${userId}`,
        status: 'success'
      });

      return existingPreferences;
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async deleteUserPreferences(userId: string): Promise<void> {
    try {
      const preferences = this.userPreferences.get(userId);
      if (!preferences) {
        throw new Error(`Preferences not found for user: ${userId}`);
      }

      this.userPreferences.delete(userId);

      // Log the deletion
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.SETTINGS,
        entityId: preferences.id,
        userId: 'system',
        details: `Deleted user preferences for user: ${userId}`,
        status: 'success'
      });
    } catch (error) {
      logger.error('Error deleting user preferences:', error);
      throw error;
    }
  }

  async getSettingsByCategory(category: SystemSettings['category']): Promise<SystemSettings[]> {
    return Array.from(this.systemSettings.values()).filter(s => s.category === category);
  }

  async getPublicSettings(): Promise<SystemSettings[]> {
    return Array.from(this.systemSettings.values()).filter(s => s.isPublic);
  }

  async validateSettings(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const requiredSettings = [
      'company_name',
      'default_currency',
      'low_stock_threshold',
      'notification_email_from',
      'shipping_carriers',
      'payment_methods',
      'report_retention_days'
    ];

    // Check for required settings
    for (const key of requiredSettings) {
      if (!this.systemSettings.has(key)) {
        errors.push(`Missing required setting: ${key}`);
      }
    }

    // Validate setting values
    for (const [key, setting] of this.systemSettings.entries()) {
      if (setting.value === undefined || setting.value === null) {
        errors.push(`Invalid value for setting: ${key}`);
      }

      // Type-specific validations
      switch (key) {
        case 'low_stock_threshold':
          if (typeof setting.value !== 'number' || setting.value < 0) {
            errors.push(`Invalid low_stock_threshold value: ${setting.value}`);
          }
          break;
        case 'shipping_carriers':
        case 'payment_methods':
          if (!Array.isArray(setting.value) || setting.value.length === 0) {
            errors.push(`Invalid ${key} value: must be a non-empty array`);
          }
          break;
        case 'report_retention_days':
          if (typeof setting.value !== 'number' || setting.value < 1) {
            errors.push(`Invalid report_retention_days value: ${setting.value}`);
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 
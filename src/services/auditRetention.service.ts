import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';
import { auditConfig } from '../config/audit.config';

export interface RetentionStats {
  totalLogs: number;
  totalSize: number;
  oldestLog: string;
  newestLog: string;
  logsToDelete: number;
  sizeToDelete: number;
}

class AuditRetentionService {
  private readonly baseUrl = `${import.meta.env.VITE_API_URL}/audit-logs/retention`;

  async getRetentionStats(): Promise<RetentionStats> {
    try {
      const response = await axios.get<RetentionStats>(this.baseUrl + '/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async applyRetentionPolicy(): Promise<void> {
    try {
      await axios.post(this.baseUrl + '/apply', {
        config: auditConfig.retention
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async archiveLogs(): Promise<void> {
    try {
      await axios.post(this.baseUrl + '/archive', {
        config: auditConfig.storage
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getArchiveStatus(): Promise<{
    lastArchiveDate: string;
    archiveSize: number;
    archiveLocation: string;
  }> {
    try {
      const response = await axios.get(this.baseUrl + '/archive/status');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const auditRetentionService = new AuditRetentionService(); 
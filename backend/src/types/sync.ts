export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum SyncType {
  FULL = 'full',
  INCREMENTAL = 'incremental'
}

export interface SyncProgress {
  syncId: string;
  status: SyncStatus;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  startTime: Date;
  endTime?: Date;
  errors: Array<{
    entity: string;
    error: string;
  }>;
} 
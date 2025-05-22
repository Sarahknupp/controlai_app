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
  JSON = 'json',
  PDF = 'pdf'
}

export interface ExportProgress {
  exportId: string;
  status: ExportStatus;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  startTime: Date;
  endTime?: Date;
  errors: Array<{
    record: string;
    error: string;
  }>;
} 
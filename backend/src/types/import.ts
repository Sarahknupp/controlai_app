export enum ImportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ImportFormat {
  CSV = 'csv',
  EXCEL = 'xlsx',
  JSON = 'json'
}

export interface ImportProgress {
  importId: string;
  status: ImportStatus;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  validRecords: number;
  invalidRecords: number;
  startTime: Date;
  endTime?: Date;
  errors: Array<{
    row: number;
    field: string;
    error: string;
  }>;
} 
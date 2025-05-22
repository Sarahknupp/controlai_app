export enum ReportType {
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  CUSTOMER = 'CUSTOMER',
  FINANCIAL = 'FINANCIAL'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Report {
  id: string;
  type: ReportType;
  name: string;
  parameters: Record<string, any>;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  emailRecipients: string[];
  content?: Buffer;
  error?: string;
} 
/**
 * Report type configuration
 * @interface ReportType
 * @property {string} id - Unique identifier for the report
 * @property {string} name - Display name of the report
 * @property {'financial' | 'inventory' | 'production' | 'sales' | 'operations' | 'administrative' | 'fiscal'} category - Report category
 * @property {string} description - Detailed description of the report
 * @property {Array<'pdf' | 'excel' | 'csv' | 'email'>} formats - Available export formats
 * @property {'pdf' | 'excel' | 'csv' | 'email'} defaultFormat - Default export format
 * @property {Array<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>} availableFrequencies - Available scheduling frequencies
 * @property {string[]} permissions - Required permissions to access this report
 * @property {ReportParameter[]} parameters - Report parameters configuration
 * @property {ReportColumn[]} columns - Report columns configuration
 * @property {ReportChart[]} [charts] - Optional charts configuration
 * @property {string[]} [subReports] - IDs of related sub-reports
 */
export interface ReportType {
  id: string;
  name: string;
  category: 'financial' | 'inventory' | 'production' | 'sales' | 'operations' | 'administrative' | 'fiscal';
  description: string;
  formats: Array<'pdf' | 'excel' | 'csv' | 'email'>;
  defaultFormat: 'pdf' | 'excel' | 'csv' | 'email';
  availableFrequencies: Array<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>;
  permissions: string[];
  parameters: ReportParameter[];
  columns: ReportColumn[];
  charts?: ReportChart[];
  subReports?: string[];
}

/**
 * Report parameter configuration
 * @interface ReportParameter
 * @property {string} id - Unique identifier for the parameter
 * @property {'date' | 'date_range' | 'select' | 'multi_select' | 'boolean' | 'number' | 'text'} type - Parameter data type
 * @property {string} label - Display label for the parameter
 * @property {boolean} required - Whether the parameter is required
 * @property {Object[]} [options] - Options for select and multi_select types
 * @property {string} [source] - Data source for dynamic options
 * @property {Object} [filter] - Filter criteria for the data source
 * @property {any} [defaultValue] - Default parameter value
 * @property {number} [minValue] - Minimum value for number type
 * @property {number} [maxValue] - Maximum value for number type
 */
export interface ReportParameter {
  id: string;
  type: 'date' | 'date_range' | 'select' | 'multi_select' | 'boolean' | 'number' | 'text';
  label: string;
  required: boolean;
  options?: Array<{
    value: string;
    label: string;
  }>;
  source?: string;
  filter?: Record<string, unknown>;
  defaultValue?: unknown;
  minValue?: number;
  maxValue?: number;
}

/**
 * Report column configuration
 * @interface ReportColumn
 * @property {string} id - Unique identifier for the column
 * @property {string} name - Display name of the column
 * @property {boolean} required - Whether the column is required
 */
export interface ReportColumn {
  id: string;
  name: string;
  required: boolean;
}

/**
 * Report chart configuration
 * @interface ReportChart
 * @property {'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar'} type - Chart type
 * @property {string} title - Chart title
 * @property {string} dataKey - Data field to use for the chart
 */
export interface ReportChart {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar';
  title: string;
  dataKey: string;
}

/**
 * Report schedule configuration
 * @interface ReportSchedule
 * @property {string} id - Unique identifier for the schedule
 * @property {string} reportId - ID of the report to schedule
 * @property {string} name - Schedule name
 * @property {'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom'} frequency - Schedule frequency
 * @property {number} [dayOfWeek] - Day of week (0-6) for weekly schedules
 * @property {number} [dayOfMonth] - Day of month (1-31) for monthly schedules
 * @property {string} time - Time in HH:MM format
 * @property {Date} lastRun - Last execution timestamp
 * @property {Date} nextRun - Next scheduled execution
 * @property {'active' | 'inactive' | 'error'} status - Current schedule status
 * @property {string[]} recipients - Email recipients
 * @property {'pdf' | 'excel' | 'csv' | 'email'} format - Output format
 * @property {Record<string, unknown>} parameters - Report parameters
 * @property {string} createdBy - User who created the schedule
 * @property {Date} createdAt - Creation timestamp
 * @property {string} [error] - Last error message if any
 */
export interface ReportSchedule {
  id: string;
  reportId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  lastRun: Date;
  nextRun: Date;
  status: 'active' | 'inactive' | 'error';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'email';
  parameters: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  error?: string;
}

/**
 * Report parameters type
 * @interface ReportParameters
 * @property {string} name - Report name
 * @property {'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom'} frequency - Report frequency
 * @property {number} [dayOfWeek] - Day of week (0-6) for weekly reports
 * @property {number} [dayOfMonth] - Day of month (1-31) for monthly reports
 * @property {string} time - Time in HH:MM format
 * @property {string} format - Output format
 * @property {string[]} recipients - Email recipients
 * @property {Record<string, unknown>} parameters - Report parameters
 */
export interface ReportParameters {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  format: string;
  recipients: string[];
  parameters: Record<string, unknown>;
}

/**
 * Report execution record
 * @interface ReportExecution
 * @property {string} id - Unique identifier for the execution
 * @property {string} [scheduleId] - ID of the schedule if scheduled
 * @property {string} reportId - ID of the report
 * @property {Date} startTime - Execution start time
 * @property {Date} [endTime] - Execution end time
 * @property {'running' | 'completed' | 'failed'} status - Execution status
 * @property {Record<string, unknown>} parameters - Report parameters used
 * @property {string} outputFormat - Output format used
 * @property {string} [outputPath] - Path to the output file
 * @property {string} [errorMessage] - Error message if failed
 * @property {string} executedBy - User who executed the report
 */
export interface ReportExecution {
  id: string;
  scheduleId?: string;
  reportId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  parameters: Record<string, unknown>;
  outputFormat: string;
  outputPath?: string;
  errorMessage?: string;
  executedBy: string;
}

/**
 * Report cache entry
 * @interface ReportCache
 * @property {string} id - Unique identifier for the cache entry
 * @property {string} reportId - ID of the report
 * @property {string} parameters - JSON stringified parameters
 * @property {string} data - JSON stringified report data
 * @property {Date} createdAt - Cache creation time
 * @property {Date} expiresAt - Cache expiration time
 */
export interface ReportCache {
  id: string;
  reportId: string;
  parameters: string;
  data: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Report email configuration
 * @interface ReportEmailConfig
 * @property {string} from - Sender email address
 * @property {string} smtpServer - SMTP server address
 * @property {number} smtpPort - SMTP server port
 * @property {string} username - SMTP authentication username
 * @property {string} password - SMTP authentication password
 * @property {boolean} useSsl - Whether to use SSL/TLS
 * @property {string} defaultSubject - Default email subject template
 * @property {string} defaultBody - Default email body template
 */
export interface ReportEmailConfig {
  from: string;
  smtpServer: string;
  smtpPort: number;
  username: string;
  password: string;
  useSsl: boolean;
  defaultSubject: string;
  defaultBody: string;
}

/**
 * Report storage configuration
 * @interface ReportStorageConfig
 * @property {'local' | 's3' | 'gcs' | 'azure' | 'dropbox'} provider - Storage provider
 * @property {string} [bucket] - Storage bucket name
 * @property {string} basePath - Base storage path
 * @property {Record<string, unknown>} [credentials] - Provider credentials
 * @property {number} retentionDays - Days to retain reports
 */
export interface ReportStorageConfig {
  provider: 'local' | 's3' | 'gcs' | 'azure' | 'dropbox';
  bucket?: string;
  basePath: string;
  credentials?: Record<string, unknown>;
  retentionDays: number;
}

/**
 * Report permission configuration
 * @interface ReportPermission
 * @property {string} reportId - ID of the report
 * @property {string} roleId - ID of the role
 * @property {boolean} canView - Whether role can view the report
 * @property {boolean} canSchedule - Whether role can schedule the report
 * @property {boolean} canExport - Whether role can export the report
 * @property {boolean} canCreate - Whether role can create new reports
 */
export interface ReportPermission {
  reportId: string;
  roleId: string;
  canView: boolean;
  canSchedule: boolean;
  canExport: boolean;
  canCreate: boolean;
}

/**
 * Report notification configuration
 * @interface ReportNotification
 * @property {string} id - Unique identifier for the notification
 * @property {string} [scheduleId] - ID of the schedule if scheduled
 * @property {string} reportId - ID of the report
 * @property {'scheduled' | 'failure' | 'threshold_alert'} type - Notification type
 * @property {string[]} recipients - Notification recipients
 * @property {string} [message] - Custom notification message
 * @property {'pending' | 'sent' | 'failed'} status - Notification status
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} [sentAt] - Send timestamp
 * @property {number} [thresholdValue] - Alert threshold value
 * @property {'greater_than' | 'less_than' | 'equal_to' | 'not_equal_to'} [thresholdCondition] - Alert condition
 */
export interface ReportNotification {
  id: string;
  scheduleId?: string;
  reportId: string;
  type: 'scheduled' | 'failure' | 'threshold_alert';
  recipients: string[];
  message?: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  thresholdValue?: number;
  thresholdCondition?: 'greater_than' | 'less_than' | 'equal_to' | 'not_equal_to';
}
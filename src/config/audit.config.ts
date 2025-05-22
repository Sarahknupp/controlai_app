export interface AuditConfig {
  retention: {
    enabled: boolean;
    duration: number; // in days
    maxSize: number; // in MB
  };
  storage: {
    type: 'local' | 's3' | 'database';
    path?: string;
    bucket?: string;
  };
  export: {
    maxRecords: number;
  };
}

export const auditConfig: AuditConfig = {
  retention: {
    enabled: true,
    duration: 365, // 1 year
    maxSize: 1024, // 1GB
  },
  storage: {
    type: 'database',
  },
  export: {
    maxRecords: 10000,
  },
}; 
import { AuditAction, EntityType, AuditStatus, AuditLog, CreateAuditLogDto } from '../types/audit';

export const isValidAuditAction = (action: string): action is AuditAction => {
  return ['create', 'update', 'delete', 'view', 'login', 'logout', 'export', 'import'].includes(action);
};

export const isValidEntityType = (type: string): type is EntityType => {
  return ['customer', 'user', 'settings', 'audit', 'product', 'order'].includes(type);
};

export const isValidAuditStatus = (status: string): status is AuditStatus => {
  return ['success', 'error', 'warning', 'info'].includes(status);
};

export const formatAuditDetails = (details: Record<string, any>): string => {
  try {
    return JSON.stringify(details);
  } catch (error) {
    console.error('Error formatting audit details:', error);
    return JSON.stringify({ error: 'Failed to format details' });
  }
};

export const parseAuditDetails = (details: string): Record<string, any> => {
  try {
    return JSON.parse(details);
  } catch (error) {
    console.error('Error parsing audit details:', error);
    return { error: 'Failed to parse details' };
  }
};

export const generateAuditCacheKey = (
  params: {
    userId?: string;
    entityType?: EntityType;
    entityId?: string;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    status?: AuditStatus;
  }
): string => {
  const parts = ['audit'];
  if (params.userId) parts.push(`user:${params.userId}`);
  if (params.entityType) parts.push(`entity:${params.entityType}`);
  if (params.entityId) parts.push(`id:${params.entityId}`);
  if (params.action) parts.push(`action:${params.action}`);
  if (params.startDate) parts.push(`start:${params.startDate}`);
  if (params.endDate) parts.push(`end:${params.endDate}`);
  if (params.status) parts.push(`status:${params.status}`);
  return parts.join(':');
};

export const validateAuditLog = (log: CreateAuditLogDto): string[] => {
  const errors: string[] = [];

  if (!log.action || !isValidAuditAction(log.action)) {
    errors.push('Invalid or missing action');
  }

  if (!log.entityType || !isValidEntityType(log.entityType)) {
    errors.push('Invalid or missing entity type');
  }

  if (!log.entityId) {
    errors.push('Missing entity ID');
  }

  if (log.status && !isValidAuditStatus(log.status)) {
    errors.push('Invalid status');
  }

  return errors;
};

export const getDefaultAuditFilters = () => ({
  page: 1,
  pageSize: 10,
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
  endDate: new Date().toISOString()
});

export const getAuditActionLabel = (action: AuditAction): string => {
  const labels: Record<AuditAction, string> = {
    create: 'Criação',
    update: 'Atualização',
    delete: 'Exclusão',
    view: 'Visualização',
    login: 'Login',
    logout: 'Logout',
    export: 'Exportação',
    import: 'Importação'
  };
  return labels[action] || action;
};

export const getEntityTypeLabel = (type: EntityType): string => {
  const labels: Record<EntityType, string> = {
    customer: 'Cliente',
    user: 'Usuário',
    settings: 'Configurações',
    audit: 'Auditoria',
    product: 'Produto',
    order: 'Pedido'
  };
  return labels[type] || type;
};

export const getAuditStatusLabel = (status: AuditStatus): string => {
  const labels: Record<AuditStatus, string> = {
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Alerta',
    info: 'Informação'
  };
  return labels[status] || status;
};

export const getAuditStatusColor = (status: AuditStatus): string => {
  const colors: Record<AuditStatus, string> = {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2196F3'
  };
  return colors[status] || '#757575';
};

export const formatAuditTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const getAuditActionIcon = (action: AuditAction): string => {
  const icons: Record<AuditAction, string> = {
    create: 'add_circle',
    update: 'edit',
    delete: 'delete',
    view: 'visibility',
    login: 'login',
    logout: 'logout',
    export: 'download',
    import: 'upload'
  };
  return icons[action] || 'help';
};

export const getEntityTypeIcon = (type: EntityType): string => {
  const icons: Record<EntityType, string> = {
    customer: 'people',
    user: 'person',
    settings: 'settings',
    audit: 'history',
    product: 'inventory',
    order: 'shopping_cart'
  };
  return icons[type] || 'help';
};

export const calculateAuditStats = (logs: AuditLog[]): {
  totalLogs: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  actionDistribution: Record<AuditAction, number>;
  entityDistribution: Record<EntityType, number>;
  userDistribution: Record<string, number>;
} => {
  const stats = {
    totalLogs: logs.length,
    successCount: 0,
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    actionDistribution: {} as Record<AuditAction, number>,
    entityDistribution: {} as Record<EntityType, number>,
    userDistribution: {} as Record<string, number>
  };

  logs.forEach(log => {
    // Count status
    if (log.status) {
      switch (log.status) {
        case 'success':
          stats.successCount++;
          break;
        case 'error':
          stats.errorCount++;
          break;
        case 'warning':
          stats.warningCount++;
          break;
        case 'info':
          stats.infoCount++;
          break;
      }
    }

    // Count actions
    stats.actionDistribution[log.action] = (stats.actionDistribution[log.action] || 0) + 1;

    // Count entities
    stats.entityDistribution[log.entityType] = (stats.entityDistribution[log.entityType] || 0) + 1;

    // Count users
    stats.userDistribution[log.userName] = (stats.userDistribution[log.userName] || 0) + 1;
  });

  return stats;
};

export const groupLogsByDate = (logs: AuditLog[]): Record<string, AuditLog[]> => {
  return logs.reduce((groups, log) => {
    const date = new Date(log.createdAt).toLocaleDateString('pt-BR');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, AuditLog[]>);
};

export const filterLogsByDateRange = (
  logs: AuditLog[],
  startDate: string,
  endDate: string
): AuditLog[] => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return logs.filter(log => {
    const logDate = new Date(log.createdAt).getTime();
    return logDate >= start && logDate <= end;
  });
};

export const sortLogsByDate = (logs: AuditLog[], ascending: boolean = false): AuditLog[] => {
  return [...logs].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const getAuditLogSummary = (log: AuditLog): string => {
  const action = getAuditActionLabel(log.action);
  const entity = getEntityTypeLabel(log.entityType);
  const user = log.userName;
  const time = formatAuditTimestamp(log.createdAt);

  return `${user} ${action} ${entity} em ${time}`;
}; 
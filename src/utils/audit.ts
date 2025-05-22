import { AuditLog, AuditAction, EntityType } from '../types/audit';
import { formatDate } from './date';

type ActionColor = 'success' | 'warning' | 'error' | 'info' | 'default';

interface ActionConfig {
  label: string;
  color: ActionColor;
  icon: string;
}

const actionConfigs: Record<AuditAction, ActionConfig> = {
  create: {
    label: 'Criar',
    color: 'success',
    icon: 'plus'
  },
  update: {
    label: 'Atualizar',
    color: 'warning',
    icon: 'edit'
  },
  delete: {
    label: 'Excluir',
    color: 'error',
    icon: 'delete'
  },
  view: {
    label: 'Visualizar',
    color: 'info',
    icon: 'eye'
  },
  login: {
    label: 'Login',
    color: 'info',
    icon: 'login'
  },
  logout: {
    label: 'Logout',
    color: 'default',
    icon: 'logout'
  },
  export: {
    label: 'Exportar',
    color: 'info',
    icon: 'download'
  },
  import: {
    label: 'Importar',
    color: 'info',
    icon: 'upload'
  }
};

const entityTypeLabels: Record<EntityType, string> = {
  customer: 'Cliente',
  user: 'Usuário',
  settings: 'Configurações',
  audit: 'Auditoria',
  product: 'Produto',
  order: 'Pedido'
};

export const getActionConfig = (action: string): ActionConfig => {
  const normalizedAction = action.toLowerCase() as AuditAction;
  return actionConfigs[normalizedAction] || {
    label: action.toUpperCase(),
    color: 'default',
    icon: 'question'
  };
};

export const getEntityTypeLabel = (type: string): string => {
  const normalizedType = type.toLowerCase() as EntityType;
  return entityTypeLabels[normalizedType] || type;
};

export const formatAuditLog = (log: AuditLog) => {
  const actionConfig = getActionConfig(log.action);
  const entityTypeLabel = getEntityTypeLabel(log.entityType);
  const formattedDate = formatDate(log.createdAt, 'dd/MM/yyyy HH:mm:ss');

  return {
    ...log,
    formattedDate,
    actionLabel: actionConfig.label,
    actionColor: actionConfig.color,
    actionIcon: actionConfig.icon,
    entityTypeLabel
  };
};

export const parseAuditDetails = (details: string): Record<string, any> => {
  try {
    return JSON.parse(details);
  } catch (error) {
    return { raw: details };
  }
};

export const getAuditLogDescription = (log: AuditLog): string => {
  const details = parseAuditDetails(log.details);
  const actionConfig = getActionConfig(log.action);
  const entityTypeLabel = getEntityTypeLabel(log.entityType);

  return `${actionConfig.label} ${entityTypeLabel} ${log.entityId}`;
};

export const getAuditLogTooltip = (log: AuditLog): string => {
  const details = parseAuditDetails(log.details);
  return JSON.stringify(details, null, 2);
};

export const isValidAuditAction = (action: string): action is AuditAction => {
  return Object.keys(actionConfigs).includes(action.toLowerCase());
};

export const isValidEntityType = (type: string): type is EntityType => {
  return Object.keys(entityTypeLabels).includes(type.toLowerCase());
};

export const getActionColor = (action: AuditAction): ActionColor => {
  return actionConfigs[action].color;
};

export const getEntityTypeOptions = (): Array<{ value: EntityType; label: string }> => {
  return Object.entries(entityTypeLabels).map(([value, label]) => ({
    value: value as EntityType,
    label
  }));
};

export const getActionOptions = (): Array<{ value: AuditAction; label: string }> => {
  return Object.entries(actionConfigs).map(([value, config]) => ({
    value: value as AuditAction,
    label: config.label
  }));
}; 
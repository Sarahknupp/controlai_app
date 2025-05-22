import { useCallback } from 'react';
import { auditService } from '../services/audit.service';
import { useAuth } from './useAuth';

type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'import';
type EntityType = 'customer' | 'user' | 'settings' | 'audit' | 'product' | 'order';

interface AuditLogOptions {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, any>;
}

export const useAudit = () => {
  const { user } = useAuth();

  const logAction = useCallback(async ({
    action,
    entityType,
    entityId,
    details
  }: AuditLogOptions) => {
    try {
      const detailsString = details ? JSON.stringify(details) : '';
      await auditService.logAction(
        action,
        entityType,
        entityId || '',
        detailsString
      );
    } catch (error) {
      // Silently fail for audit logging to prevent disrupting the main flow
      console.error('Failed to log audit action:', error);
    }
  }, []);

  const logCustomerAction = useCallback(async (
    action: AuditAction,
    customerId: string,
    details?: Record<string, any>
  ) => {
    await logAction({
      action,
      entityType: 'customer',
      entityId: customerId,
      details
    });
  }, [logAction]);

  const logUserAction = useCallback(async (
    action: AuditAction,
    userId: string,
    details?: Record<string, any>
  ) => {
    await logAction({
      action,
      entityType: 'user',
      entityId: userId,
      details
    });
  }, [logAction]);

  const logSettingsAction = useCallback(async (
    action: AuditAction,
    details?: Record<string, any>
  ) => {
    await logAction({
      action,
      entityType: 'settings',
      details
    });
  }, [logAction]);

  const logProductAction = useCallback(async (
    action: AuditAction,
    productId: string,
    details?: Record<string, any>
  ) => {
    await logAction({
      action,
      entityType: 'product',
      entityId: productId,
      details
    });
  }, [logAction]);

  const logOrderAction = useCallback(async (
    action: AuditAction,
    orderId: string,
    details?: Record<string, any>
  ) => {
    await logAction({
      action,
      entityType: 'order',
      entityId: orderId,
      details
    });
  }, [logAction]);

  const logAuditAction = useCallback(async (
    action: AuditAction,
    details?: Record<string, any>
  ) => {
    await logAction({
      action,
      entityType: 'audit',
      details
    });
  }, [logAction]);

  return {
    logAction,
    logCustomerAction,
    logUserAction,
    logSettingsAction,
    logProductAction,
    logOrderAction,
    logAuditAction
  };
}; 
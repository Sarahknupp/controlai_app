import { renderHook } from '@testing-library/react';
import { useAudit } from '../useAudit';
import { auditService } from '../../services/audit.service';
import { useAuth } from '../useAuth';

// Mock dependencies
jest.mock('../../services/audit.service');
jest.mock('../useAuth');

describe('useAudit', () => {
  const mockUser = { id: 'user-1', name: 'Test User' };
  const mockAuditService = auditService as jest.Mocked<typeof auditService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  describe('logAction', () => {
    it('should log a generic action', async () => {
      const { result } = renderHook(() => useAudit());
      const details = { field: 'value' };

      await result.current.logAction({
        action: 'create',
        entityType: 'customer',
        entityId: 'customer-1',
        details
      });

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'create',
        'customer',
        'customer-1',
        JSON.stringify(details)
      );
    });

    it('should handle missing entityId', async () => {
      const { result } = renderHook(() => useAudit());

      await result.current.logAction({
        action: 'view',
        entityType: 'settings'
      });

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'view',
        'settings',
        '',
        ''
      );
    });

    it('should handle missing details', async () => {
      const { result } = renderHook(() => useAudit());

      await result.current.logAction({
        action: 'delete',
        entityType: 'product',
        entityId: 'product-1'
      });

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'delete',
        'product',
        'product-1',
        ''
      );
    });

    it('should handle errors silently', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockAuditService.logAction.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useAudit());

      await result.current.logAction({
        action: 'update',
        entityType: 'user',
        entityId: 'user-1'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to log audit action:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('entity-specific logging', () => {
    it('should log customer actions', async () => {
      const { result } = renderHook(() => useAudit());
      const details = { name: 'New Customer' };

      await result.current.logCustomerAction('create', 'customer-1', details);

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'create',
        'customer',
        'customer-1',
        JSON.stringify(details)
      );
    });

    it('should log user actions', async () => {
      const { result } = renderHook(() => useAudit());
      const details = { role: 'admin' };

      await result.current.logUserAction('update', 'user-1', details);

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'update',
        'user',
        'user-1',
        JSON.stringify(details)
      );
    });

    it('should log settings actions', async () => {
      const { result } = renderHook(() => useAudit());
      const details = { theme: 'dark' };

      await result.current.logSettingsAction('update', details);

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'update',
        'settings',
        '',
        JSON.stringify(details)
      );
    });

    it('should log product actions', async () => {
      const { result } = renderHook(() => useAudit());
      const details = { price: 99.99 };

      await result.current.logProductAction('create', 'product-1', details);

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'create',
        'product',
        'product-1',
        JSON.stringify(details)
      );
    });

    it('should log order actions', async () => {
      const { result } = renderHook(() => useAudit());
      const details = { status: 'completed' };

      await result.current.logOrderAction('update', 'order-1', details);

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'update',
        'order',
        'order-1',
        JSON.stringify(details)
      );
    });

    it('should log audit actions', async () => {
      const { result } = renderHook(() => useAudit());
      const details = { retention: '30 days' };

      await result.current.logAuditAction('view', details);

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'view',
        'audit',
        '',
        JSON.stringify(details)
      );
    });
  });

  describe('hook dependencies', () => {
    it('should use the current user from useAuth', () => {
      const { result } = renderHook(() => useAudit());

      expect(useAuth).toHaveBeenCalled();
      expect(result.current).toBeDefined();
    });

    it('should memoize callback functions', () => {
      const { result, rerender } = renderHook(() => useAudit());
      const firstResult = result.current;

      rerender();
      expect(result.current).toBe(firstResult);
    });
  });
}); 
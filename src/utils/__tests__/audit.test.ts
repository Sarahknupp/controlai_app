import { AuditLog } from '../../types/audit';
import {
  getActionConfig,
  getEntityTypeLabel,
  formatAuditLog,
  parseAuditDetails,
  getAuditLogDescription,
  getAuditLogTooltip
} from '../audit';
import { formatDate } from '../date';

// Mock the date utility
jest.mock('../date', () => ({
  formatDate: jest.fn((date) => '01/01/2024 00:00:00')
}));

describe('Audit Utilities', () => {
  const mockLog: AuditLog = {
    id: '1',
    action: 'create',
    entityType: 'user',
    entityId: '123',
    details: JSON.stringify({
      message: 'User created successfully',
      reason: 'New user registration',
      changes: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      },
      metadata: {
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop'
      }
    }),
    createdAt: '2024-01-01T00:00:00Z',
    userId: '1',
    userName: 'Test User',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActionConfig', () => {
    it('should return correct config for known actions', () => {
      const createConfig = getActionConfig('create');
      expect(createConfig).toEqual({
        label: 'Criar',
        color: 'success',
        icon: 'plus'
      });

      const updateConfig = getActionConfig('update');
      expect(updateConfig).toEqual({
        label: 'Atualizar',
        color: 'warning',
        icon: 'edit'
      });

      const deleteConfig = getActionConfig('delete');
      expect(deleteConfig).toEqual({
        label: 'Excluir',
        color: 'error',
        icon: 'delete'
      });
    });

    it('should return default config for unknown actions', () => {
      const config = getActionConfig('unknown');
      expect(config).toEqual({
        label: 'UNKNOWN',
        color: 'default'
      });
    });
  });

  describe('getEntityTypeLabel', () => {
    it('should return correct label for known entity types', () => {
      expect(getEntityTypeLabel('customer')).toBe('Cliente');
      expect(getEntityTypeLabel('user')).toBe('Usuário');
      expect(getEntityTypeLabel('settings')).toBe('Configurações');
    });

    it('should return original type for unknown entity types', () => {
      expect(getEntityTypeLabel('unknown')).toBe('unknown');
    });
  });

  describe('formatAuditLog', () => {
    it('should format log with all required fields', () => {
      const formatted = formatAuditLog(mockLog);

      expect(formatted).toEqual({
        ...mockLog,
        formattedDate: '01/01/2024 00:00:00',
        actionLabel: 'Criar',
        actionColor: 'success',
        actionIcon: 'plus',
        entityTypeLabel: 'Usuário'
      });

      expect(formatDate).toHaveBeenCalledWith('2024-01-01T00:00:00Z', 'dd/MM/yyyy HH:mm:ss');
    });
  });

  describe('parseAuditDetails', () => {
    it('should parse valid JSON details', () => {
      const details = JSON.stringify({
        message: 'Test message',
        changes: { field: 'value' }
      });

      const parsed = parseAuditDetails(details);
      expect(parsed).toEqual({
        message: 'Test message',
        changes: { field: 'value' }
      });
    });

    it('should handle invalid JSON details', () => {
      const details = 'invalid json';
      const parsed = parseAuditDetails(details);
      expect(parsed).toEqual({ raw: 'invalid json' });
    });

    it('should handle empty details', () => {
      const parsed = parseAuditDetails('');
      expect(parsed).toEqual({ raw: '' });
    });
  });

  describe('getAuditLogDescription', () => {
    it('should generate description with all available information', () => {
      const description = getAuditLogDescription(mockLog);
      expect(description).toBe('Criar Usuário #123: User created successfully');
    });

    it('should generate description without entity ID', () => {
      const logWithoutId = { ...mockLog, entityId: '' };
      const description = getAuditLogDescription(logWithoutId);
      expect(description).toBe('Criar Usuário: User created successfully');
    });

    it('should generate description without message', () => {
      const logWithoutMessage = {
        ...mockLog,
        details: JSON.stringify({ changes: { field: 'value' } })
      };
      const description = getAuditLogDescription(logWithoutMessage);
      expect(description).toBe('Criar Usuário #123');
    });
  });

  describe('getAuditLogTooltip', () => {
    it('should generate tooltip with all available information', () => {
      const tooltip = getAuditLogTooltip(mockLog);
      expect(tooltip).toContain('Alterações:');
      expect(tooltip).toContain('name: "Test User"');
      expect(tooltip).toContain('email: "test@example.com"');
      expect(tooltip).toContain('role: "admin"');
      expect(tooltip).toContain('Motivo: New user registration');
      expect(tooltip).toContain('Metadados:');
      expect(tooltip).toContain('browser: "Chrome"');
      expect(tooltip).toContain('os: "Windows"');
      expect(tooltip).toContain('device: "Desktop"');
    });

    it('should handle log without changes', () => {
      const logWithoutChanges = {
        ...mockLog,
        details: JSON.stringify({
          message: 'Test message',
          reason: 'Test reason'
        })
      };
      const tooltip = getAuditLogTooltip(logWithoutChanges);
      expect(tooltip).toBe('Motivo: Test reason');
    });

    it('should handle log without reason', () => {
      const logWithoutReason = {
        ...mockLog,
        details: JSON.stringify({
          changes: { field: 'value' }
        })
      };
      const tooltip = getAuditLogTooltip(logWithoutReason);
      expect(tooltip).toBe('Alterações:\nfield: "value"');
    });

    it('should handle log without metadata', () => {
      const logWithoutMetadata = {
        ...mockLog,
        details: JSON.stringify({
          changes: { field: 'value' },
          reason: 'Test reason'
        })
      };
      const tooltip = getAuditLogTooltip(logWithoutMetadata);
      expect(tooltip).toBe('Alterações:\nfield: "value"\nMotivo: Test reason');
    });

    it('should handle invalid JSON details', () => {
      const logWithInvalidDetails = {
        ...mockLog,
        details: 'invalid json'
      };
      const tooltip = getAuditLogTooltip(logWithInvalidDetails);
      expect(tooltip).toBe('');
    });
  });
}); 
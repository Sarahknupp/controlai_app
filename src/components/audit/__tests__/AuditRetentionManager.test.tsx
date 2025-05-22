import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuditRetentionManager from '../AuditRetentionManager';
import { auditService } from '../../../services/audit.service';
import { useNotification } from '../../../context/NotificationContext';
import { useAudit } from '../../../hooks/useAudit';
import dayjs from 'dayjs';

// Mock dependencies
jest.mock('../../../services/audit.service');
jest.mock('../../../context/NotificationContext');
jest.mock('../../../hooks/useAudit');
jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return {
    ...actual,
    format: jest.fn(() => '01/01/2024 10:00')
  };
});

describe('AuditRetentionManager', () => {
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();
  const mockLogAuditAction = jest.fn();

  const mockStats = {
    totalLogs: 1000,
    logsToDelete: 100,
    totalSize: 500,
    sizeToDelete: 50
  };

  const mockArchiveStatus = {
    lastArchiveDate: '2024-01-01T10:00:00Z',
    archiveSize: 200,
    archiveLocation: '/archives/2024-01'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNotification as jest.Mock).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError
    });
    (useAudit as jest.Mock).mockReturnValue({
      logAuditAction: mockLogAuditAction
    });
    (auditService.getRetentionStats as jest.Mock).mockResolvedValue(mockStats);
    (auditService.getArchiveStatus as jest.Mock).mockResolvedValue(mockArchiveStatus);
  });

  it('should render loading state initially', () => {
    render(<AuditRetentionManager />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render retention statistics correctly', async () => {
    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(screen.getByText('Total de Logs')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('Logs para Exclusão')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Tamanho Total')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('Tamanho para Exclusão')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  it('should render archive status correctly', async () => {
    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(screen.getByText('Último Arquivamento')).toBeInTheDocument();
      expect(screen.getByText('01/01/2024 10:00')).toBeInTheDocument();
      expect(screen.getByText('Tamanho do Arquivo')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('Localização')).toBeInTheDocument();
      expect(screen.getByText('/archives/2024-01')).toBeInTheDocument();
    });
  });

  it('should handle form submission correctly', async () => {
    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(screen.getByText('Política de Retenção')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText('Período de Retenção (dias)'), { target: { value: '180' } });
    fireEvent.change(screen.getByLabelText('Período de Arquivamento (dias)'), { target: { value: '365' } });
    fireEvent.change(screen.getByLabelText('Tamanho Máximo (MB)'), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText('Compressão'), { target: { value: 'true' } });

    // Submit form
    fireEvent.click(screen.getByText('Aplicar Política'));

    await waitFor(() => {
      expect(auditService.applyRetentionPolicy).toHaveBeenCalledWith({
        retentionPeriod: 180,
        archivePeriod: 365,
        maxSize: 2000,
        compressionEnabled: true
      });
      expect(mockLogAuditAction).toHaveBeenCalledWith('update', {
        type: 'retention_policy',
        retentionPeriod: 180,
        archivePeriod: 365,
        maxSize: 2000,
        compressionEnabled: true
      });
      expect(mockShowSuccess).toHaveBeenCalledWith('Política de retenção aplicada com sucesso');
    });
  });

  it('should handle archive action correctly', async () => {
    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(screen.getByText('Arquivar Logs')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Arquivar Logs'));

    await waitFor(() => {
      expect(auditService.archiveLogs).toHaveBeenCalled();
      expect(mockLogAuditAction).toHaveBeenCalledWith('export', {
        type: 'archive',
        timestamp: expect.any(String)
      });
      expect(mockShowSuccess).toHaveBeenCalledWith('Logs arquivados com sucesso');
    });
  });

  it('should handle error when fetching stats', async () => {
    const error = new Error('Failed to fetch stats');
    (auditService.getRetentionStats as jest.Mock).mockRejectedValueOnce(error);

    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Erro ao carregar estatísticas',
        'Não foi possível carregar as estatísticas de retenção'
      );
    });
  });

  it('should handle error when fetching archive status', async () => {
    const error = new Error('Failed to fetch archive status');
    (auditService.getArchiveStatus as jest.Mock).mockRejectedValueOnce(error);

    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Erro ao carregar status do arquivo',
        'Não foi possível carregar o status do arquivo'
      );
    });
  });

  it('should handle error when applying retention policy', async () => {
    const error = new Error('Failed to apply policy');
    (auditService.applyRetentionPolicy as jest.Mock).mockRejectedValueOnce(error);

    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(screen.getByText('Aplicar Política')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Aplicar Política'));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Erro ao aplicar política',
        'Não foi possível aplicar a política de retenção'
      );
    });
  });

  it('should handle error when archiving logs', async () => {
    const error = new Error('Failed to archive logs');
    (auditService.archiveLogs as jest.Mock).mockRejectedValueOnce(error);

    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(screen.getByText('Arquivar Logs')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Arquivar Logs'));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Erro ao arquivar logs',
        'Não foi possível arquivar os logs'
      );
    });
  });

  it('should validate form fields', async () => {
    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(screen.getByText('Aplicar Política')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Aplicar Política'));

    await waitFor(() => {
      expect(screen.getByText('Por favor, informe o período de retenção')).toBeInTheDocument();
      expect(screen.getByText('Por favor, informe o período de arquivamento')).toBeInTheDocument();
      expect(screen.getByText('Por favor, informe o tamanho máximo')).toBeInTheDocument();
    });
  });

  it('should enforce min/max values for numeric inputs', async () => {
    render(<AuditRetentionManager />);

    await waitFor(() => {
      expect(screen.getByText('Política de Retenção')).toBeInTheDocument();
    });

    // Try to set invalid values
    fireEvent.change(screen.getByLabelText('Período de Retenção (dias)'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Período de Arquivamento (dias)'), { target: { value: '4000' } });
    fireEvent.change(screen.getByLabelText('Tamanho Máximo (MB)'), { target: { value: '50' } });

    // Submit form
    fireEvent.click(screen.getByText('Aplicar Política'));

    await waitFor(() => {
      expect(auditService.applyRetentionPolicy).not.toHaveBeenCalled();
    });
  });
}); 
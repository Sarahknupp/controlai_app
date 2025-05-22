import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuditLogs from '../AuditLogs';
import { auditService } from '../../services/audit.service';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useNotification } from '../../context/NotificationContext';
import { AuditLog } from '../../types/audit';
import dayjs from 'dayjs';

// Mock dependencies
jest.mock('../../services/audit.service');
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/usePermissions');
jest.mock('../../context/NotificationContext');
jest.mock('../../components/audit/AuditLogComparison', () => ({
  AuditLogComparison: ({ logs }: { logs: AuditLog[] }) => (
    <div data-testid="audit-log-comparison">
      {logs.map(log => (
        <div key={log.id} data-testid={`comparison-log-${log.id}`}>
          {log.action}
        </div>
      ))}
    </div>
  )
}));

describe('AuditLogs', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  };

  const mockLogs: AuditLog[] = [
    {
      id: '1',
      action: 'create',
      entityType: 'user',
      entityId: '123',
      details: JSON.stringify({ name: 'Test User' }),
      createdAt: '2024-01-01T00:00:00Z',
      userId: '1',
      userName: 'Test User',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0'
    },
    {
      id: '2',
      action: 'update',
      entityType: 'user',
      entityId: '123',
      details: JSON.stringify({ name: 'Updated User' }),
      createdAt: '2024-01-02T00:00:00Z',
      userId: '1',
      userName: 'Test User',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0'
    }
  ];

  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    });

    (usePermissions as jest.Mock).mockReturnValue({
      hasPermission: jest.fn().mockReturnValue(true)
    });

    (useNotification as jest.Mock).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError
    });

    (auditService.getLogs as jest.Mock).mockResolvedValue({
      data: mockLogs,
      total: mockLogs.length
    });

    (auditService.getStats as jest.Mock).mockResolvedValue({
      totalLogs: 100,
      activeUsers: 50,
      modifiedEntities: 30,
      errorRate: 0.05,
      actionDistribution: [
        { action: 'create', count: 50 },
        { action: 'update', count: 30 },
        { action: 'delete', count: 20 }
      ],
      entityDistribution: [
        { entityType: 'user', count: 40 },
        { entityType: 'customer', count: 60 }
      ],
      userActivity: [
        { userName: 'Test User', count: 80 },
        { userName: 'Other User', count: 20 }
      ],
      activityTrend: [
        { date: '2024-01-01', count: 30 },
        { date: '2024-01-02', count: 70 }
      ]
    });
  });

  it('should render audit logs table with all columns', async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText('Data/Hora')).toBeInTheDocument();
      expect(screen.getByText('Usuário')).toBeInTheDocument();
      expect(screen.getByText('Ação')).toBeInTheDocument();
      expect(screen.getByText('Entidade')).toBeInTheDocument();
      expect(screen.getByText('ID da Entidade')).toBeInTheDocument();
      expect(screen.getByText('Detalhes')).toBeInTheDocument();
      expect(screen.getByText('IP')).toBeInTheDocument();
    });
  });

  it('should handle log selection and comparison', async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Select logs for comparison
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first log
    fireEvent.click(checkboxes[2]); // Select second log

    // Compare button should be enabled
    const compareButton = screen.getByText('Comparar Selecionados');
    expect(compareButton).not.toBeDisabled();

    // Click compare button
    fireEvent.click(compareButton);

    // Comparison modal should be visible
    expect(screen.getByTestId('audit-log-comparison')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-log-1')).toBeInTheDocument();
    expect(screen.getByTestId('comparison-log-2')).toBeInTheDocument();
  });

  it('should handle log filtering with all filter types', async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Test search filter
    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Test date range filter
    const rangePicker = screen.getByRole('combobox');
    fireEvent.mouseDown(rangePicker);
    const startDate = dayjs('2024-01-01');
    const endDate = dayjs('2024-01-31');
    fireEvent.change(rangePicker, { target: { value: [startDate, endDate] } });

    // Test entity type filter
    const entityTypeSelect = screen.getByPlaceholderText('Tipo de Entidade');
    fireEvent.mouseDown(entityTypeSelect);
    fireEvent.click(screen.getByText('Usuário'));

    // Verify that getLogs was called with correct filters
    expect(auditService.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'test',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        entityType: 'user'
      })
    );
  });

  it('should handle log export', async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Click export button
    const exportButton = screen.getByText('Exportar');
    fireEvent.click(exportButton);

    // Click export option
    const exportOption = screen.getByText('Exportar Logs');
    fireEvent.click(exportOption);

    expect(auditService.exportLogs).toHaveBeenCalledWith(expect.any(Object));
    expect(mockShowSuccess).toHaveBeenCalledWith('Exportação concluída com sucesso');
  });

  it('should show statistics tab with all metrics', async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Switch to statistics tab
    const statsTab = screen.getByText('Estatísticas');
    fireEvent.click(statsTab);

    // Verify that all statistics are displayed
    await waitFor(() => {
      expect(screen.getByText('Total de Logs')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Usuários Ativos')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('Entidades Modificadas')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Taxa de Erro')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });
  });

  it('should handle error states and show error message', async () => {
    (auditService.getLogs as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch logs'));

    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar logs de auditoria')).toBeInTheDocument();
    });
  });

  it('should handle permission check and show access denied message', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      hasPermission: jest.fn().mockReturnValue(false)
    });

    render(<AuditLogs />);

    expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
    expect(screen.getByText('Você não tem permissão para visualizar os logs de auditoria.')).toBeInTheDocument();
  });

  it('should handle log details view', async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Click on log details
    const detailsCell = screen.getByText('Test User');
    fireEvent.click(detailsCell);

    // Details modal should be visible
    expect(screen.getByTestId('audit-log-details')).toBeInTheDocument();
  });

  it('should handle pagination', async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Change page
    const nextPageButton = screen.getByRole('button', { name: 'Next Page' });
    fireEvent.click(nextPageButton);

    expect(auditService.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2
      })
    );
  });

  it('should handle refresh action', async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: 'Atualizar' });
    fireEvent.click(refreshButton);

    expect(auditService.getLogs).toHaveBeenCalledTimes(2);
  });
}); 
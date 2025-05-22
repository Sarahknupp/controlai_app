import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuditStats } from '../AuditStats';
import { auditService } from '../../../services/audit.service';
import { NotificationProvider } from '../../../context/NotificationContext';
import { getActionConfig } from '../../../utils/audit.utils';
import { useNotification } from '../../../context/NotificationContext';

// Mock dependencies
jest.mock('../../../services/audit.service');
jest.mock('../../../context/NotificationContext');
jest.mock('@ant-design/plots', () => ({
  Line: () => <div data-testid="line-chart" />,
  Pie: () => <div data-testid="pie-chart" />,
  Bar: () => <div data-testid="bar-chart" />
}));

// Mock the audit utils
jest.mock('../../../utils/audit.utils', () => ({
  getActionConfig: jest.fn((action) => ({
    label: action === 'CREATE' ? 'Criar' : action === 'UPDATE' ? 'Atualizar' : 'Excluir'
  }))
}));

const mockStats = {
  totalLogs: 100,
  activeUsers: 10,
  modifiedEntities: 50,
  errorRate: 5,
  actionDistribution: [
    { action: 'CREATE', count: 30 },
    { action: 'UPDATE', count: 40 },
    { action: 'DELETE', count: 30 }
  ],
  entityDistribution: [
    { entityType: 'customer', count: 40 },
    { entityType: 'order', count: 35 },
    { entityType: 'product', count: 25 }
  ],
  userActivity: [
    { userName: 'John Doe', count: 45 },
    { userName: 'Jane Smith', count: 35 },
    { userName: 'Bob Johnson', count: 20 }
  ],
  activityTrend: [
    { date: '2024-01-01', count: 10 },
    { date: '2024-01-02', count: 15 },
    { date: '2024-01-03', count: 20 }
  ]
};

describe('AuditStats', () => {
  const mockShowError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNotification as jest.Mock).mockReturnValue({ showError: mockShowError });
    (auditService.getStats as jest.Mock).mockResolvedValue(mockStats);
  });

  it('should render loading state initially', () => {
    render(<AuditStats />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render error state when stats fetch fails', async () => {
    const error = new Error('Failed to fetch stats');
    (auditService.getStats as jest.Mock).mockRejectedValueOnce(error);

    render(<AuditStats />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar estatísticas')).toBeInTheDocument();
      expect(mockShowError).toHaveBeenCalledWith(
        'Erro ao carregar estatísticas',
        'Failed to fetch stats'
      );
    });
  });

  it('should render empty state when no stats are available', async () => {
    (auditService.getStats as jest.Mock).mockResolvedValueOnce(null);

    render(<AuditStats />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma estatística disponível')).toBeInTheDocument();
    });
  });

  it('should render all statistics cards with correct values', async () => {
    render(<AuditStats />);

    await waitFor(() => {
      expect(screen.getByText('Total de Logs')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();

      expect(screen.getByText('Usuários Ativos')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();

      expect(screen.getByText('Entidades Modificadas')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();

      expect(screen.getByText('Taxa de Erro')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });
  });

  it('should render all charts', async () => {
    render(<AuditStats />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('should fetch stats with filters', async () => {
    const filters = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      userId: 'user-1',
      action: 'create',
      entityType: 'customer'
    };

    render(<AuditStats filters={filters} />);

    await waitFor(() => {
      expect(auditService.getStats).toHaveBeenCalledWith(filters);
    });
  });

  it('should refresh stats when retry button is clicked', async () => {
    render(<AuditStats />);

    await waitFor(() => {
      expect(auditService.getStats).toHaveBeenCalledTimes(1);
    });

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(auditService.getStats).toHaveBeenCalledTimes(2);
    });
  });

  it('should refresh stats when refresh button is clicked', async () => {
    render(<AuditStats />);

    await waitFor(() => {
      expect(auditService.getStats).toHaveBeenCalledTimes(1);
    });

    const refreshButtons = screen.getAllByRole('button', { name: /reload/i });
    fireEvent.click(refreshButtons[0]);

    await waitFor(() => {
      expect(auditService.getStats).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle empty distributions', async () => {
    const emptyStats = {
      ...mockStats,
      actionDistribution: [],
      entityDistribution: [],
      userActivity: [],
      activityTrend: []
    };

    (auditService.getStats as jest.Mock).mockResolvedValueOnce(emptyStats);

    render(<AuditStats />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network error');
    (auditService.getStats as jest.Mock).mockRejectedValueOnce(networkError);

    render(<AuditStats />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar estatísticas')).toBeInTheDocument();
      expect(mockShowError).toHaveBeenCalledWith(
        'Erro ao carregar estatísticas',
        'Network error'
      );
    });
  });

  it('should transform action distribution data correctly', async () => {
    render(
      <NotificationProvider>
        <AuditStats />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Distribuição por Ação')).toBeInTheDocument();
    });

    // Verify getActionConfig was called for each action
    expect(getActionConfig).toHaveBeenCalledWith('CREATE');
    expect(getActionConfig).toHaveBeenCalledWith('UPDATE');
    expect(getActionConfig).toHaveBeenCalledWith('DELETE');
  });

  it('should transform entity distribution data correctly', async () => {
    render(
      <NotificationProvider>
        <AuditStats />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Distribuição por Entidade')).toBeInTheDocument();
    });

    // Verify entity types are displayed
    expect(screen.getByText('customer')).toBeInTheDocument();
    expect(screen.getByText('order')).toBeInTheDocument();
    expect(screen.getByText('product')).toBeInTheDocument();
  });

  it('should transform user activity data correctly', async () => {
    render(
      <NotificationProvider>
        <AuditStats />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Atividade por Usuário')).toBeInTheDocument();
    });

    // Verify user names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should transform activity trend data correctly', async () => {
    render(
      <NotificationProvider>
        <AuditStats />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tendência de Atividade')).toBeInTheDocument();
    });

    // Verify trend data is displayed
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('2024-01-02')).toBeInTheDocument();
    expect(screen.getByText('2024-01-03')).toBeInTheDocument();
  });

  it('should handle filters prop', async () => {
    const filters = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      userId: '123',
      action: 'CREATE',
      entityType: 'customer'
    };

    render(
      <NotificationProvider>
        <AuditStats filters={filters} />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(auditService.getStats).toHaveBeenCalledWith(filters);
    });
  });

  it('should refresh data when clicking refresh buttons in cards', async () => {
    render(
      <NotificationProvider>
        <AuditStats />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tendência de Atividade')).toBeInTheDocument();
    });

    // Click refresh button in trend card
    const refreshButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(refreshButtons[0]);

    // Verify getStats was called again
    expect(auditService.getStats).toHaveBeenCalledTimes(2);
  });
}); 
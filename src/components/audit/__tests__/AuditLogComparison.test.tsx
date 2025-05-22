import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuditLogComparison } from '../AuditLogComparison';
import { AuditLog } from '../../../types/audit';
import { getActionConfig } from '../../../utils/audit';
import { formatDate } from '../../../utils/date';

// Mock dependencies
jest.mock('../../../utils/date');
jest.mock('../../../utils/audit');

describe('AuditLogComparison', () => {
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      action: 'create',
      entityType: 'user',
      entityId: 'user-1',
      userName: 'User 1',
      userId: 'user-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: '2024-01-01T10:00:00Z',
      details: JSON.stringify({
        name: 'Test Item',
        status: 'active',
        value: 100
      })
    },
    {
      id: '2',
      action: 'update',
      entityType: 'user',
      entityId: 'user-1',
      userName: 'User 2',
      userId: 'user-2',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: '2024-01-01T11:00:00Z',
      details: JSON.stringify({
        name: 'Test Item',
        status: 'inactive',
        value: 200
      })
    }
  ];

  const mockActionConfig = {
    label: 'Create',
    color: 'green'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (formatDate as jest.Mock).mockImplementation((date) => date);
    (getActionConfig as jest.Mock).mockReturnValue(mockActionConfig);
  });

  it('should render empty state when no logs are provided', () => {
    render(
      <AuditLogComparison
        logs={[]}
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Nenhum log para comparar')).toBeInTheDocument();
  });

  it('should render modal with correct title and info tooltip', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Comparação de Logs de Auditoria')).toBeInTheDocument();
    expect(screen.getByTitle('Mostra as alterações entre os logs em ordem cronológica')).toBeInTheDocument();
  });

  it('should render timeline with all logs', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={() => {}}
      />
    );

    mockLogs.forEach(log => {
      expect(screen.getByText(log.userName)).toBeInTheDocument();
      expect(screen.getByText(log.createdAt)).toBeInTheDocument();
    });
  });

  it('should render action tags with correct colors', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={() => {}}
      />
    );

    const tags = screen.getAllByText(mockActionConfig.label);
    tags.forEach(tag => {
      expect(tag).toHaveClass(`ant-tag-${mockActionConfig.color}`);
    });
  });

  it('should render log details correctly', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={() => {}}
      />
    );

    // Check first log details
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('status')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();

    // Check second log details
    expect(screen.getByText('inactive')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('should highlight changed values between logs', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={() => {}}
      />
    );

    const changedValues = screen.getAllByTitle('Valor alterado');
    expect(changedValues).toHaveLength(2); // status and value changed
  });

  it('should show comparison tooltip for logs after the first one', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={() => {}}
      />
    );

    const comparisonTooltips = screen.getAllByTitle(/Comparando com log de/);
    expect(comparisonTooltips).toHaveLength(1); // Only for the second log
  });

  it('should handle invalid JSON in details', () => {
    const logsWithInvalidJson: AuditLog[] = [
      {
        ...mockLogs[0],
        details: 'invalid json'
      }
    ];

    render(
      <AuditLogComparison
        logs={logsWithInvalidJson}
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('invalid json')).toBeInTheDocument();
  });

  it('should call onClose when modal is closed', () => {
    const onClose = jest.fn();
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should render object values as JSON strings', () => {
    const logsWithObjectValues: AuditLog[] = [
      {
        ...mockLogs[0],
        details: JSON.stringify({
          config: { enabled: true, options: ['a', 'b'] }
        })
      }
    ];

    render(
      <AuditLogComparison
        logs={logsWithObjectValues}
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('{"enabled":true,"options":["a","b"]}')).toBeInTheDocument();
  });

  it('should handle multiple logs with different actions', () => {
    const multipleLogs: AuditLog[] = [
      ...mockLogs,
      {
        id: '3',
        action: 'delete',
        entityType: 'user',
        entityId: 'user-1',
        userName: 'User 3',
        userId: 'user-3',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: '2024-01-01T12:00:00Z',
        details: JSON.stringify({
          name: 'Test Item',
          status: 'deleted'
        })
      }
    ];

    render(
      <AuditLogComparison
        logs={multipleLogs}
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('User 3')).toBeInTheDocument();
    expect(screen.getByText('deleted')).toBeInTheDocument();
  });
}); 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuditLogComparison } from '../AuditLogComparison';
import type { AuditLog, AuditAction, EntityType, AuditStatus } from '../../../types/audit';
import { getActionConfig, getEntityTypeLabel } from '../../../utils/audit';
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
      userName: 'John Doe',
      userId: 'user-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: '2024-01-01T10:00:00Z',
      details: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
      }, null, 2)
    },
    {
      id: '2',
      action: 'update',
      entityType: 'user',
      entityId: 'user-1',
      userName: 'John Doe',
      userId: 'user-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: '2024-01-01T11:00:00Z',
      details: JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin'
      }, null, 2)
    }
  ];

  const mockActionConfig = {
    create: { label: 'Create', color: 'green' },
    update: { label: 'Update', color: 'blue' },
    delete: { label: 'Delete', color: 'red' },
    view: { label: 'View', color: 'blue' },
    login: { label: 'Login', color: 'green' },
    logout: { label: 'Logout', color: 'orange' },
    export: { label: 'Export', color: 'purple' },
    import: { label: 'Import', color: 'cyan' }
  } as const;

  const mockEntityTypeLabel = 'Usuário';

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (formatDate as jest.Mock).mockImplementation((date) => date);
    (getActionConfig as jest.Mock).mockImplementation((action: AuditAction) => mockActionConfig[action]);
    (getEntityTypeLabel as jest.Mock).mockReturnValue(mockEntityTypeLabel);
  });

  it('should render empty state when no logs are provided', () => {
    render(
      <AuditLogComparison
        logs={[]}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Nenhum log selecionado para comparação')).toBeInTheDocument();
  });

  it('should render modal with correct title and info tooltip', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Comparação de Logs')).toBeInTheDocument();
    expect(screen.getByText('Visualize as alterações entre os logs selecionados')).toBeInTheDocument();
  });

  it('should render timeline with all logs', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('2024-01-01T10:00:00Z')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01T11:00:00Z')).toBeInTheDocument();
  });

  it('should render action tags with correct colors', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const createTag = screen.getByText('Create');
    const updateTag = screen.getByText('Update');

    expect(createTag).toHaveClass('ant-tag-green');
    expect(updateTag).toHaveClass('ant-tag-blue');
  });

  it('should render log details correctly', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('role')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('should highlight changed values between logs', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const changedValues = screen.getAllByText(/john\.doe@example\.com|admin/);
    changedValues.forEach(value => {
      expect(value).toHaveClass('highlight-change');
    });
  });

  it('should show comparison tooltip for logs after the first one', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const tooltips = screen.getAllByText('Comparar com log anterior');
    expect(tooltips).toHaveLength(mockLogs.length - 1);
  });

  it('should handle invalid JSON in details', () => {
    const logsWithInvalidJson: AuditLog[] = [
      {
        id: '1',
        action: 'create',
        entityType: 'user',
        entityId: 'user-1',
        userName: 'John Doe',
        userId: 'user-1',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: '2024-01-01T10:00:00Z',
        details: 'invalid json'
      },
      {
        id: '2',
        action: 'update',
        entityType: 'user',
        entityId: 'user-1',
        userName: 'John Doe',
        userId: 'user-1',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: '2024-01-01T11:00:00Z',
        details: JSON.stringify({
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'admin'
        }, null, 2)
      }
    ];

    render(
      <AuditLogComparison
        logs={logsWithInvalidJson}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('invalid json')).toBeInTheDocument();
  });

  it('should call onClose when modal is closed', () => {
    render(
      <AuditLogComparison
        logs={mockLogs}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render object values as JSON strings', () => {
    const logsWithObjectValues: AuditLog[] = [
      {
        id: '1',
        action: 'create',
        entityType: 'user',
        entityId: 'user-1',
        userName: 'John Doe',
        userId: 'user-1',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: '2024-01-01T10:00:00Z',
        details: JSON.stringify({
          config: { theme: 'dark', notifications: true }
        }, null, 2)
      },
      {
        id: '2',
        action: 'update',
        entityType: 'user',
        entityId: 'user-1',
        userName: 'John Doe',
        userId: 'user-1',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: '2024-01-01T11:00:00Z',
        details: JSON.stringify({
          config: { theme: 'light', notifications: false }
        }, null, 2)
      }
    ];

    render(
      <AuditLogComparison
        logs={logsWithObjectValues}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('config')).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify({ theme: 'dark', notifications: true }, null, 2))).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify({ theme: 'light', notifications: false }, null, 2))).toBeInTheDocument();
  });

  it('should handle multiple logs with different actions', () => {
    const logsWithDifferentActions: AuditLog[] = [
      ...mockLogs,
      {
        id: '3',
        action: 'delete',
        entityType: 'user',
        entityId: 'user-1',
        userName: 'John Doe',
        userId: 'user-1',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: '2024-01-01T12:00:00Z',
        details: JSON.stringify({
          reason: 'User requested deletion'
        }, null, 2)
      }
    ];

    render(
      <AuditLogComparison
        logs={logsWithDifferentActions}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
}); 
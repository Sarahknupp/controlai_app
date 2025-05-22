import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuditLogDetails from '../AuditLogDetails';
import { AuditLog } from '../../../types/audit';
import { getActionConfig, getEntityTypeLabel, parseAuditDetails } from '../../../utils/audit';
import { formatDate } from '../../../utils/date';

// Mock dependencies
jest.mock('../../../utils/date');
jest.mock('../../../utils/audit');

describe('AuditLogDetails', () => {
  const mockLog: AuditLog = {
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
      message: 'User created successfully',
      reason: 'New user registration',
      changes: {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
      },
      metadata: {
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop'
      },
      raw: { additional: 'data' }
    })
  };

  const mockActionConfig = {
    label: 'Create',
    color: 'green'
  };

  const mockEntityTypeLabel = 'Usuário';

  const mockParsedDetails = {
    message: 'User created successfully',
    reason: 'New user registration',
    changes: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    },
    metadata: {
      browser: 'Chrome',
      os: 'Windows',
      device: 'Desktop'
    },
    raw: { additional: 'data' }
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (formatDate as jest.Mock).mockReturnValue('01/01/2024 10:00:00');
    (getActionConfig as jest.Mock).mockReturnValue(mockActionConfig);
    (getEntityTypeLabel as jest.Mock).mockReturnValue(mockEntityTypeLabel);
    (parseAuditDetails as jest.Mock).mockReturnValue(mockParsedDetails);
  });

  it('should render log details', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Check if modal title and main fields are displayed
    expect(screen.getByText('Detalhes do Log de Auditoria')).toBeInTheDocument();
    expect(screen.getByText('Data/Hora')).toBeInTheDocument();
    expect(screen.getByText('Usuário')).toBeInTheDocument();
    expect(screen.getByText('Ação')).toBeInTheDocument();
    expect(screen.getByText('Entidade')).toBeInTheDocument();
    expect(screen.getByText('ID da Entidade')).toBeInTheDocument();
    expect(screen.getByText('Endereço IP')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('user-1')).toBeInTheDocument();
    expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
  });

  it('should parse and display JSON details', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Check if JSON details are parsed and displayed
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('role')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('should display message and reason sections', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Mensagem')).toBeInTheDocument();
    expect(screen.getByText('User created successfully')).toBeInTheDocument();
    expect(screen.getByText('Motivo')).toBeInTheDocument();
    expect(screen.getByText('New user registration')).toBeInTheDocument();
  });

  it('should display metadata section', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Metadados')).toBeInTheDocument();
    expect(screen.getByText('browser')).toBeInTheDocument();
    expect(screen.getByText('Chrome')).toBeInTheDocument();
    expect(screen.getByText('os')).toBeInTheDocument();
    expect(screen.getByText('Windows')).toBeInTheDocument();
    expect(screen.getByText('device')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });

  it('should handle close button click', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Click close button (AntD uses 'Close' as aria-label)
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when visible is false', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={false}
        onClose={mockOnClose}
      />
    );

    // Modal should not be in document
    expect(screen.queryByText('Detalhes do Log de Auditoria')).not.toBeInTheDocument();
  });

  it('should render nothing when log is null', () => {
    const { container } = render(
      <AuditLogDetails
        log={null}
        visible={true}
        onClose={mockOnClose}
      />
    );
    // Should render nothing
    expect(container).toBeEmptyDOMElement();
  });

  it('should handle invalid JSON details', () => {
    const invalidLog: AuditLog = {
      ...mockLog,
      details: 'invalid json'
    };

    render(
      <AuditLogDetails
        log={invalidLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Should show raw details
    expect(screen.getByText('invalid json')).toBeInTheDocument();
  });

  it('should call utility functions with correct parameters', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(getActionConfig).toHaveBeenCalledWith('create');
    expect(getEntityTypeLabel).toHaveBeenCalledWith('user');
    expect(formatDate).toHaveBeenCalledWith('2024-01-01T10:00:00Z', 'dd/MM/yyyy HH:mm:ss');
  });

  it('should display loading state', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
        loading={true}
      />
    );

    expect(screen.getByText('Carregando detalhes...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorMessage = 'Failed to load log details';
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
        error={errorMessage}
      />
    );

    expect(screen.getByText('Erro ao carregar detalhes')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Check if modal has proper ARIA attributes
    const modal = screen.getByLabelText('Detalhes do Log de Auditoria');
    expect(modal).toBeInTheDocument();

    // Check if all interactive elements are accessible
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
  });

  it('should handle empty details object', () => {
    const emptyLog: AuditLog = {
      ...mockLog,
      details: JSON.stringify({})
    };

    render(
      <AuditLogDetails
        log={emptyLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Should still show basic log information
    expect(screen.getByText('Data/Hora')).toBeInTheDocument();
    expect(screen.getByText('Usuário')).toBeInTheDocument();
    expect(screen.getByText('Ação')).toBeInTheDocument();

    // Should not show optional sections
    expect(screen.queryByText('Mensagem')).not.toBeInTheDocument();
    expect(screen.queryByText('Motivo')).not.toBeInTheDocument();
    expect(screen.queryByText('Alterações')).not.toBeInTheDocument();
    expect(screen.queryByText('Metadados')).not.toBeInTheDocument();
  });

  it('should render raw details section', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Detalhes Brutos')).toBeInTheDocument();
    expect(screen.getByText('{"additional":"data"}')).toBeInTheDocument();
  });

  it('should handle missing optional sections', () => {
    const logWithoutOptionalSections: AuditLog = {
      ...mockLog,
      details: JSON.stringify({})
    };

    (parseAuditDetails as jest.Mock).mockReturnValueOnce({});

    render(
      <AuditLogDetails
        log={logWithoutOptionalSections}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Mensagem')).not.toBeInTheDocument();
    expect(screen.queryByText('Motivo')).not.toBeInTheDocument();
    expect(screen.queryByText('Alterações')).not.toBeInTheDocument();
    expect(screen.queryByText('Metadados')).not.toBeInTheDocument();
    expect(screen.queryByText('Detalhes Brutos')).not.toBeInTheDocument();
  });

  it('should handle invalid JSON in details', () => {
    const logWithInvalidJson: AuditLog = {
      ...mockLog,
      details: 'invalid json'
    };

    (parseAuditDetails as jest.Mock).mockReturnValueOnce({});

    render(
      <AuditLogDetails
        log={logWithInvalidJson}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('01/01/2024 10:00:00')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render action tag with correct color', () => {
    render(
      <AuditLogDetails
        log={mockLog}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const actionTag = screen.getByText('Create');
    expect(actionTag).toHaveClass(`ant-tag-${mockActionConfig.color}`);
  });
}); 
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserAuditLog } from '../UserAuditLog';
import { mockUserAuditLogs, mockUserAccounts } from '../../../data/mockUserManagement';

// Mock the mock data
jest.mock('../../../data/mockUserManagement', () => ({
  mockUserAuditLogs: [
    {
      id: '1',
      userId: 'user1',
      action: 'login',
      timestamp: new Date('2024-01-01T10:00:00Z'),
      details: 'User logged in successfully',
      performedBy: 'user1',
      ipAddress: '127.0.0.1'
    },
    {
      id: '2',
      userId: 'user1',
      action: 'password_change',
      timestamp: new Date('2024-01-02T11:00:00Z'),
      details: 'Password changed',
      performedBy: 'user1',
      ipAddress: '127.0.0.1'
    },
    {
      id: '3',
      userId: 'user1',
      action: 'role_change',
      timestamp: new Date('2024-01-03T12:00:00Z'),
      details: 'Role changed to admin',
      performedBy: 'admin1',
      ipAddress: '127.0.0.1'
    }
  ],
  mockUserAccounts: [
    {
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      status: 'active'
    },
    {
      id: 'admin1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active'
    }
  ]
}));

describe('UserAuditLog', () => {
  it('should render loading state initially', () => {
    render(<UserAuditLog userId="user1" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render user audit logs', async () => {
    render(<UserAuditLog userId="user1" />);

    // Wait for logs to load
    await waitFor(() => {
      expect(screen.getByText('Audit Log for testuser')).toBeInTheDocument();
    });

    // Check if all logs are displayed
    expect(screen.getByText('Logged in')).toBeInTheDocument();
    expect(screen.getByText('Password changed')).toBeInTheDocument();
    expect(screen.getByText('Role changed')).toBeInTheDocument();

    // Check if details are displayed
    expect(screen.getByText('User logged in successfully')).toBeInTheDocument();
    expect(screen.getByText('Password changed')).toBeInTheDocument();
    expect(screen.getByText('Role changed to admin')).toBeInTheDocument();

    // Check if timestamps are displayed
    expect(screen.getByText(/Jan 01, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 02, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 03, 2024/)).toBeInTheDocument();

    // Check if IP addresses are displayed
    expect(screen.getByText('IP: 127.0.0.1')).toBeInTheDocument();

    // Check if performed by users are displayed
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('should display empty state when no logs are found', async () => {
    // Override mock data for this test
    (mockUserAuditLogs as any) = [];

    render(<UserAuditLog userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('No activity logs found for this user.')).toBeInTheDocument();
    });
  });

  it('should sort logs by newest first', async () => {
    render(<UserAuditLog userId="user1" />);

    await waitFor(() => {
      const timestamps = screen.getAllByText(/Jan \d{2}, 2024/);
      expect(timestamps[0].textContent).toContain('Jan 03, 2024');
      expect(timestamps[1].textContent).toContain('Jan 02, 2024');
      expect(timestamps[2].textContent).toContain('Jan 01, 2024');
    });
  });

  it('should display correct action icons', async () => {
    render(<UserAuditLog userId="user1" />);

    await waitFor(() => {
      // Check for login icon (green)
      const loginIcon = screen.getByText('Logged in').closest('div')?.querySelector('svg');
      expect(loginIcon).toHaveClass('text-green-500');

      // Check for password change icon (purple)
      const passwordIcon = screen.getByText('Password changed').closest('div')?.querySelector('svg');
      expect(passwordIcon).toHaveClass('text-purple-500');

      // Check for role change icon (indigo)
      const roleIcon = screen.getByText('Role changed').closest('div')?.querySelector('svg');
      expect(roleIcon).toHaveClass('text-indigo-500');
    });
  });

  it('should handle error state', async () => {
    // Mock console.error to prevent error output in tests
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Override mock data to simulate an error
    (mockUserAuditLogs as any) = null;

    render(<UserAuditLog userId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('No activity logs found for this user.')).toBeInTheDocument();
    });

    // Restore console.error
    console.error = originalConsoleError;
  });
}); 
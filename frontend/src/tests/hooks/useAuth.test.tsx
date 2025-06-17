import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../hooks/useAuth';
import '@testing-library/jest-dom';

// Mock fetch
const originalFetch = global.fetch;
global.fetch = jest.fn();

// Test component that uses the auth hook
const TestComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-role">{user?.role || 'No Role'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with no authentication', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
  });

  it('restores authentication from localStorage', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN' as const,
      name: 'Test User'
    };

    localStorage.setItem('authToken', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
  });

  it('handles successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN' as const,
      name: 'Test User'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'mock-token', user: mockUser })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
    });

    expect(localStorage.getItem('authToken')).toBe('mock-token');
    expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(mockUser);
  });

  it('handles login failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
    });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('handles logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN' as const,
      name: 'Test User'
    };

    localStorage.setItem('authToken', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('throws error when used outside AuthProvider', () => {
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = consoleError;
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });
});

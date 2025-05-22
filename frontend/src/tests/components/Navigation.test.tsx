import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { AuthProvider } from '../../hooks/useAuth';
import '@testing-library/jest-dom';

// Mock useMediaQuery
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn()
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Navigation', () => {
  const mockUser = {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    active: true,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders login and register buttons when not authenticated', () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders admin navigation when authenticated as admin', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'test-token');

    renderWithRouter(<Navigation />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('renders only logout button when authenticated as regular user', () => {
    const regularUser = { ...mockUser, role: 'USER' };
    localStorage.setItem('user', JSON.stringify(regularUser));
    localStorage.setItem('authToken', 'test-token');

    renderWithRouter(<Navigation />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'test-token');

    renderWithRouter(<Navigation />);

    fireEvent.click(screen.getByText('Logout'));

    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  describe('Mobile view', () => {
    beforeEach(() => {
      (require('@mui/material').useMediaQuery as jest.Mock).mockReturnValue(true);
    });

    it('shows mobile menu when clicking menu button', () => {
      renderWithRouter(<Navigation />);

      fireEvent.click(screen.getByLabelText('menu'));

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('shows admin menu items when authenticated as admin', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'test-token');

      renderWithRouter(<Navigation />);

      fireEvent.click(screen.getByLabelText('menu'));

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('closes mobile menu when clicking menu item', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'test-token');

      renderWithRouter(<Navigation />);

      fireEvent.click(screen.getByLabelText('menu'));
      fireEvent.click(screen.getByText('Dashboard'));

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Desktop view', () => {
    beforeEach(() => {
      (require('@mui/material').useMediaQuery as jest.Mock).mockReturnValue(false);
    });

    it('shows navigation buttons directly', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'test-token');

      renderWithRouter(<Navigation />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.queryByLabelText('menu')).not.toBeInTheDocument();
    });
  });
}); 
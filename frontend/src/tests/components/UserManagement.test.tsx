import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userService from '../../services/user.service';
import UserManagement from '../../components/UserManagement';
import '@testing-library/jest-dom';

// Mock userService
jest.mock('../../services/user.service', () => ({
  __esModule: true,
  default: {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    resetPassword: jest.fn()
  }
}));

describe('UserManagement', () => {
  const mockUsers = [
    {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      active: true,
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z',
      lastLogin: '2024-03-20T15:00:00Z'
    },
    {
      id: '2',
      email: 'user@example.com',
      name: 'Regular User',
      role: 'USER',
      active: true,
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);
  });

  it('renders loading state initially', () => {
    render(<UserManagement />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders users table after loading', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Regular User')).toBeInTheDocument();
    });

    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    const errorMessage = 'Failed to fetch users';
    (userService.getUsers as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('opens create user dialog when clicking Add User', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add User'));

    expect(screen.getByText('Add New User')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('creates new user successfully', async () => {
    const newUser = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      role: 'USER' as const
    };

    (userService.createUser as jest.Mock).mockResolvedValueOnce({
      id: '3',
      ...newUser,
      active: true,
      createdAt: '2024-03-20T16:00:00Z',
      updatedAt: '2024-03-20T16:00:00Z'
    });

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add User'));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: newUser.name }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: newUser.email }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: newUser.password }
    });
    fireEvent.mouseDown(screen.getByLabelText('Role'));
    fireEvent.click(screen.getByText('User'));

    fireEvent.click(screen.getByText('Create User'));

    await waitFor(() => {
      expect(userService.createUser).toHaveBeenCalledWith(newUser);
      expect(userService.getUsers).toHaveBeenCalledTimes(2);
    });
  });

  it('opens edit user dialog when clicking Edit in menu', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Admin User');
    expect(screen.getByLabelText('Email')).toHaveValue('admin@example.com');
    expect(screen.getByLabelText('Role')).toHaveValue('ADMIN');
  });

  it('updates user successfully', async () => {
    const updatedData = {
      name: 'Updated Admin',
      email: 'admin@example.com',
      role: 'ADMIN' as const
    };

    (userService.updateUser as jest.Mock).mockResolvedValueOnce({
      id: '1',
      ...updatedData,
      active: true,
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T16:00:00Z'
    });

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Edit'));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: updatedData.name }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith('1', updatedData);
      expect(userService.getUsers).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes user successfully', async () => {
    (userService.deleteUser as jest.Mock).mockResolvedValueOnce(undefined);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith('1');
      expect(userService.getUsers).toHaveBeenCalledTimes(2);
    });
  });

  it('resets user password successfully', async () => {
    (userService.resetPassword as jest.Mock).mockResolvedValueOnce(undefined);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Reset Password'));

    await waitFor(() => {
      expect(userService.resetPassword).toHaveBeenCalledWith('1');
    });
  });

  it('toggles user active status', async () => {
    (userService.updateUser as jest.Mock).mockResolvedValueOnce({
      ...mockUsers[0],
      active: false
    });

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const switchElement = screen.getAllByRole('checkbox')[0];
    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith('1', { active: false });
      expect(userService.getUsers).toHaveBeenCalledTimes(2);
    });
  });

  it('refreshes user list when clicking Refresh button', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalledTimes(2);
    });
  });
}); 
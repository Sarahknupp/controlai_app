import userService from '../../services/user.service';
import { User } from '../../types/user.types';

// Mock fetch
const originalFetch = global.fetch;
global.fetch = jest.fn();

describe('UserService', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    active: true,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  };

  const mockUsers: User[] = [mockUser];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      });

      const result = await userService.getUsers();
      expect(result).toEqual(mockUsers);
      expect(global.fetch).toHaveBeenCalledWith('/api/users', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(userService.getUsers()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('getUser', () => {
    it('should fetch single user successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser)
      });

      const result = await userService.getUser('1');
      expect(result).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith('/api/users/1', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(userService.getUser('1')).rejects.toThrow('Failed to fetch user');
    });
  });

  describe('createUser', () => {
    const createData = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      role: 'USER' as const
    };

    it('should create user successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockUser, ...createData })
      });

      const result = await userService.createUser(createData);
      expect(result).toEqual({ ...mockUser, ...createData });
      expect(global.fetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(createData)
      });
    });

    it('should throw error with message from server', async () => {
      const errorMessage = 'Email already exists';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage })
      });

      await expect(userService.createUser(createData)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateUser', () => {
    const updateData = {
      name: 'Updated Name',
      role: 'ADMIN' as const
    };

    it('should update user successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockUser, ...updateData })
      });

      const result = await userService.updateUser('1', updateData);
      expect(result).toEqual({ ...mockUser, ...updateData });
      expect(global.fetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(updateData)
      });
    });

    it('should throw error with message from server', async () => {
      const errorMessage = 'User not found';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage })
      });

      await expect(userService.updateUser('1', updateData)).rejects.toThrow(errorMessage);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await userService.deleteUser('1');
      expect(global.fetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });

    it('should throw error with message from server', async () => {
      const errorMessage = 'Cannot delete last admin';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage })
      });

      await expect(userService.deleteUser('1')).rejects.toThrow(errorMessage);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await userService.resetPassword('1');
      expect(global.fetch).toHaveBeenCalledWith('/api/users/1/reset-password', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
    });

    it('should throw error with message from server', async () => {
      const errorMessage = 'User not found';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage })
      });

      await expect(userService.resetPassword('1')).rejects.toThrow(errorMessage);
    });
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });
});

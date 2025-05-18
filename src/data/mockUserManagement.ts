import { UserAccount, UserRole, UserAuditLog } from '../types/userManagement';

// Mock User Roles
export const mockUserRoles: UserRole[] = [
  {
    id: 'admin',
    name: 'Administrator',
    permissions: ['users.manage', 'roles.manage', 'settings.manage', 'logs.view', 'reports.view', 'reports.create'],
    description: 'Full system access with all permissions'
  },
  {
    id: 'manager',
    name: 'Manager',
    permissions: ['users.view', 'reports.view', 'reports.create'],
    description: 'Can manage general store operations and view reports'
  },
  {
    id: 'staff',
    name: 'Staff',
    permissions: ['products.view', 'inventory.view', 'production.manage'],
    description: 'Regular staff member with limited access'
  },
  {
    id: 'cashier',
    name: 'Cashier',
    permissions: ['pos.access'],
    description: 'Can access POS system only'
  },
  {
    id: 'accountant',
    name: 'Accountant',
    permissions: ['accounting.view', 'reports.view', 'fiscal.manage'],
    description: 'Access to accounting and fiscal features'
  }
];

// Mock User Accounts 
export const mockUserAccounts: UserAccount[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@bakery.com',
    passwordHash: '$2a$10$KIRqA0E7GMCu1k1D9a6BCu5JM/8KYUftvrHVSw0WZ5MHy3HVz6xC2', // admin123
    fullName: 'Admin User',
    roleId: 'admin',
    roleName: 'Administrator',
    isActive: true,
    lastLogin: new Date('2023-11-05T08:30:00'),
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00'),
    failedLoginAttempts: 0
  },
  {
    id: '2',
    username: 'manager',
    email: 'manager@bakery.com',
    passwordHash: '$2a$10$nBJQnVL8qFVhkF1BfrpBv.h5P1HVm8F4nC7iRgEJkPuT4Vl1tZkMm', // manager123
    fullName: 'Manager User',
    roleId: 'manager',
    roleName: 'Manager',
    isActive: true,
    lastLogin: new Date('2023-11-04T09:15:00'),
    createdAt: new Date('2023-01-02T00:00:00'),
    updatedAt: new Date('2023-01-02T00:00:00'),
    failedLoginAttempts: 0
  },
  {
    id: '3',
    username: 'staff',
    email: 'staff@bakery.com',
    passwordHash: '$2a$10$oRBB9tA1hPuLcQnZKi1A9uBoc5r4YQKxJGTbQC.0yjnNZNwTaLk/e', // staff123
    fullName: 'Staff User',
    roleId: 'staff',
    roleName: 'Staff',
    isActive: true,
    lastLogin: new Date('2023-11-05T07:45:00'),
    createdAt: new Date('2023-01-03T00:00:00'),
    updatedAt: new Date('2023-01-03T00:00:00'),
    failedLoginAttempts: 0
  },
  {
    id: '4',
    username: 'cashier',
    email: 'cashier@bakery.com',
    passwordHash: '$2a$10$9/WLEq2d7jqPGQjbJ/mCKeD.wR2Z7jYNYbTd8PpBEY5EuRWdCS9tu', // cashier123
    fullName: 'Cashier User',
    roleId: 'cashier',
    roleName: 'Cashier',
    isActive: true,
    lastLogin: new Date('2023-11-05T06:20:00'),
    createdAt: new Date('2023-01-04T00:00:00'),
    updatedAt: new Date('2023-01-04T00:00:00'),
    failedLoginAttempts: 0
  },
  {
    id: '5',
    username: 'accountant',
    email: 'accountant@bakery.com',
    passwordHash: '$2a$10$tGDjJU844zJfpzv3A4BD0OjNOYWFw74.jQT7iiOhUY/aYQNwzrx/K', // accountant123
    fullName: 'Accountant User',
    roleId: 'accountant',
    roleName: 'Accountant',
    isActive: false,
    lastLogin: new Date('2023-10-29T10:15:00'),
    createdAt: new Date('2023-01-05T00:00:00'),
    updatedAt: new Date('2023-10-15T00:00:00'),
    failedLoginAttempts: 0
  },
  {
    id: '6',
    username: 'inactive',
    email: 'inactive@bakery.com',
    passwordHash: '$2a$10$Bj3kF4DDLP0qSuzlHlmvYOtRyNNT1LKsYmwbA1GJjcIBgUDgEAkma', // inactive123
    fullName: 'Inactive User',
    roleId: 'staff',
    roleName: 'Staff',
    isActive: false,
    createdAt: new Date('2023-01-06T00:00:00'),
    updatedAt: new Date('2023-01-06T00:00:00'),
    failedLoginAttempts: 0
  }
];

// Mock User Audit Logs
export const mockUserAuditLogs: UserAuditLog[] = [
  {
    id: '1',
    userId: '1',
    action: 'login',
    performedBy: '1',
    timestamp: new Date('2023-11-05T08:30:00'),
    details: 'User logged in successfully',
    ipAddress: '192.168.1.1'
  },
  {
    id: '2',
    userId: '2',
    action: 'login',
    performedBy: '2',
    timestamp: new Date('2023-11-04T09:15:00'),
    details: 'User logged in successfully',
    ipAddress: '192.168.1.2'
  },
  {
    id: '3',
    userId: '5',
    action: 'status_change',
    performedBy: '1',
    timestamp: new Date('2023-10-15T14:20:00'),
    details: 'User account deactivated',
    ipAddress: '192.168.1.1'
  },
  {
    id: '4',
    userId: '3',
    action: 'password_change',
    performedBy: '3',
    timestamp: new Date('2023-10-10T11:45:00'),
    details: 'Password changed successfully',
    ipAddress: '192.168.1.3'
  },
  {
    id: '5',
    userId: '7',
    action: 'create',
    performedBy: '1',
    timestamp: new Date('2023-09-20T10:30:00'),
    details: 'New user account created',
    ipAddress: '192.168.1.1'
  },
  {
    id: '6',
    userId: '7',
    action: 'delete',
    performedBy: '1',
    timestamp: new Date('2023-09-25T16:15:00'),
    details: 'User account deleted',
    ipAddress: '192.168.1.1'
  }
];

// Helper function to validate password complexity
export const validatePasswordComplexity = (password: string): PasswordComplexityResult => {
  const minLength = 8;
  const hasMinLength = password.length >= minLength;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // Calculate score (0-5)
  const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar]
    .filter(Boolean).length;
  
  const valid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  
  return {
    valid,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
    score
  };
};

// Helper function to create an audit log
export const createAuditLog = (
  userId: string,
  action: UserAuditLog['action'],
  performedBy: string,
  details?: string
): UserAuditLog => {
  return {
    id: `log-${Date.now()}`,
    userId,
    action,
    performedBy,
    timestamp: new Date(),
    details,
    ipAddress: '127.0.0.1' // In a real app, we would get the actual IP
  };
};
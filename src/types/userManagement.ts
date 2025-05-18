/**
 * User role definition with permissions
 * @interface UserRoleDefinition
 * @property {string} id - Unique identifier for the role
 * @property {string} name - Role name
 * @property {string[]} permissions - List of permissions granted by this role
 * @property {string} description - Role description
 */
export interface UserRoleDefinition {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

/**
 * User audit log entry
 * @interface UserAuditLog
 * @property {string} id - Unique identifier for the log entry
 * @property {string} userId - ID of the user being audited
 * @property {'create' | 'update' | 'delete' | 'login' | 'logout' | 'password_change' | 'role_change' | 'status_change'} action - Audit action type
 * @property {string} performedBy - ID of the user who performed the action
 * @property {Date} timestamp - When the action occurred
 * @property {string} [details] - Additional action details
 * @property {string} [ipAddress] - IP address where the action originated
 */
export interface UserAuditLog {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'password_change' | 'role_change' | 'status_change';
  performedBy: string;
  timestamp: Date;
  details?: string;
  ipAddress?: string;
}

/**
 * User account information
 * @interface UserAccount
 * @property {string} id - Unique identifier for the user
 * @property {string} username - User's login username
 * @property {string} email - User's email address
 * @property {string} passwordHash - Hashed password
 * @property {string} fullName - User's full name
 * @property {string} roleId - ID of the user's role
 * @property {string} roleName - Name of the user's role
 * @property {boolean} isActive - Whether the account is active
 * @property {Date} [lastLogin] - Last login timestamp
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {string} [createdBy] - ID of user who created the account
 * @property {string} [updatedBy] - ID of user who last updated the account
 * @property {boolean} [requirePasswordChange] - Whether user must change password
 * @property {number} [failedLoginAttempts] - Number of failed login attempts
 * @property {Date} [lockedUntil] - Account lock expiration time
 */
export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  requirePasswordChange?: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
}

/**
 * Password change request
 * @interface PasswordChangeRequest
 * @property {string} currentPassword - Current password
 * @property {string} newPassword - New password
 * @property {string} confirmPassword - New password confirmation
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Password complexity check result
 * @interface PasswordComplexityResult
 * @property {boolean} valid - Whether password meets all requirements
 * @property {boolean} hasMinLength - Has minimum length
 * @property {boolean} hasUpperCase - Has uppercase letter
 * @property {boolean} hasLowerCase - Has lowercase letter
 * @property {boolean} hasNumber - Has number
 * @property {boolean} hasSpecialChar - Has special character
 * @property {number} score - Password strength score (0-100)
 */
export interface PasswordComplexityResult {
  valid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  score: number;
}

/**
 * User filter criteria
 * @interface UserFilter
 * @property {string} [search] - Search term for filtering
 * @property {string} [role] - Filter by role
 * @property {'active' | 'inactive' | 'all'} [status] - Filter by status
 * @property {'username' | 'email' | 'fullName' | 'roleName' | 'lastLogin' | 'createdAt' | 'isActive'} [sortBy] - Sort field
 * @property {'asc' | 'desc'} [sortDirection] - Sort direction
 */
export interface UserFilter {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'username' | 'email' | 'fullName' | 'roleName' | 'lastLogin' | 'createdAt' | 'isActive';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Bulk action configuration
 * @interface BulkAction
 * @property {string[]} ids - IDs of users to act on
 * @property {'activate' | 'deactivate' | 'delete' | 'changeRole'} action - Action to perform
 * @property {string} [roleId] - New role ID for changeRole action
 */
export interface BulkAction {
  ids: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'changeRole';
  roleId?: string;
}
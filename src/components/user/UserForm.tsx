import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { mockUserRoles } from '../../data/mockUserManagement';
import { validatePasswordComplexity, getPasswordStrengthLabel, getPasswordStrengthColor } from '../../utils/passwordUtils';
import { UserAccount } from '../../types/userManagement';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';

interface UserFormProps {
  user: UserAccount | null;
  onSubmit: (userData: Partial<UserAccount>) => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const { user: currentUser } = useAuth();
  const isEditing = !!user;
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    roleId: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        fullName: user.fullName,
        roleId: user.roleId,
        isActive: user.isActive
      });
    } else {
      // Reset form for new user
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        roleId: mockUserRoles[0]?.id || '',
        isActive: true
      });
    }
  }, [user]);
  
  useEffect(() => {
    if (formData.password) {
      const result = validatePasswordComplexity(formData.password);
      setPasswordStrength({
        score: result.score,
        label: getPasswordStrengthLabel(result.score)
      });
    } else {
      setPasswordStrength({ score: 0, label: '' });
    }
  }, [formData.password]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Required fields
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is not valid';
    }
    
    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password && !validatePasswordComplexity(formData.password).valid) {
      newErrors.password = 'Password does not meet security requirements';
    }
    
    if (!isEditing && !formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.roleId) {
      newErrors.roleId = 'User role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for submission
    const userData: Partial<UserAccount> = {
      id: user?.id,
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      roleId: formData.roleId,
      roleName: mockUserRoles.find(role => role.id === formData.roleId)?.name || '',
      isActive: formData.isActive,
      updatedAt: new Date(),
      updatedBy: currentUser?.id
    };
    
    // Only include password if it's set (for new users or password changes)
    if (formData.password) {
      // In a real app, this would be hashed before sending to the server
      userData.passwordHash = `$2a$10$${formData.password}`;
    }
    
    onSubmit(userData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.username ? 'border-red-300' : ''
              }`}
              value={formData.username}
              onChange={handleInputChange}
              disabled={isEditing} // Username cannot be changed once set
            />
            {errors.username && (
              <p className="mt-2 text-sm text-red-600">{errors.username}</p>
            )}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="fullName"
              name="fullName"
              autoComplete="name"
              className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.fullName ? 'border-red-300' : ''
              }`}
              value={formData.fullName}
              onChange={handleInputChange}
            />
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.email ? 'border-red-300' : ''
              }`}
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="roleId"
              name="roleId"
              className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.roleId ? 'border-red-300' : ''
              }`}
              value={formData.roleId}
              onChange={handleInputChange}
            >
              <option value="">Select a role</option>
              {mockUserRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="mt-2 text-sm text-red-600">{errors.roleId}</p>
            )}
          </div>
        </div>

        {/* Password field (hidden for editing unless changing password) */}
        <div className="sm:col-span-3">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {isEditing ? 'New Password' : 'Password'} {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              autoComplete={isEditing ? "new-password" : "new-password"}
              className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md ${
                errors.password ? 'border-red-300' : ''
              }`}
              value={formData.password}
              onChange={handleInputChange}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            ) : formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Password strength: {passwordStrength.label}</span>
                  <span className="text-xs text-gray-500">Score: {passwordStrength.score}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`} 
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {isEditing && (
              <p className="mt-2 text-xs text-gray-500">
                Leave blank to keep current password.
              </p>
            )}
          </div>
          
          {/* Password requirements */}
          {(formData.password || !isEditing) && (
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-500 font-medium">Password must contain:</p>
              <ul className="text-xs space-y-1">
                <li className="flex items-center">
                  {formData.password && formData.password.length >= 8 
                    ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                  At least 8 characters
                </li>
                <li className="flex items-center">
                  {formData.password && /[A-Z]/.test(formData.password)
                    ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                  At least 1 uppercase letter
                </li>
                <li className="flex items-center">
                  {formData.password && /[a-z]/.test(formData.password)
                    ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                  At least 1 lowercase letter
                </li>
                <li className="flex items-center">
                  {formData.password && /[0-9]/.test(formData.password)
                    ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                  At least 1 number
                </li>
                <li className="flex items-center">
                  {formData.password && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
                    ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                  At least 1 special character
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {isEditing ? 'Confirm New Password' : 'Confirm Password'} {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <div className="mt-1">
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              autoComplete={isEditing ? "new-password" : "new-password"}
              className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.confirmPassword ? 'border-red-300' : ''
              }`}
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            {errors.confirmPassword ? (
              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
            ) : (
              formData.confirmPassword && formData.password && (
                <div className="mt-2 flex items-center">
                  {formData.confirmPassword === formData.password ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-xs text-red-500">Passwords do not match</span>
                    </>
                  )}
                </div>
              )
            )}
          </div>
        </div>
        
        <div className="sm:col-span-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isActive" className="font-medium text-gray-700">Account Active</label>
              <p className="text-gray-500">Inactive users cannot log in to the system.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Security Note */}
      {!isEditing && (
        <div className="bg-blue-50 rounded-md p-3 text-sm text-blue-700 flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
          <div>
            <p>New users will be required to change their password on first login.</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};
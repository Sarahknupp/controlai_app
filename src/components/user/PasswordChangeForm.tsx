import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';
import { validatePasswordComplexity, getPasswordStrengthLabel, getPasswordStrengthColor, doPasswordsMatch } from '../../utils/passwordUtils';
import { PasswordChangeRequest } from '../../types/userManagement';
import { mockUserAccounts, createAuditLog } from '../../data/mockUserManagement';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface PasswordChangeFormProps {
  userId?: string; // If not provided, uses current user
  onSuccess?: () => void;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ userId, onSuccess }) => {
  const { user } = useAuth();
  const currentUserId = userId || (user?.id || '');
  
  const [formData, setFormData] = useState<PasswordChangeRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Evaluate password strength when it changes
  useEffect(() => {
    if (formData.newPassword) {
      const result = validatePasswordComplexity(formData.newPassword);
      setPasswordStrength({
        score: result.score,
        label: getPasswordStrengthLabel(result.score)
      });
    } else {
      setPasswordStrength({ score: 0, label: '' });
    }
  }, [formData.newPassword]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
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
    
    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const result = validatePasswordComplexity(formData.newPassword);
      if (!result.valid) {
        newErrors.newPassword = 'Password does not meet complexity requirements';
      }
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (!doPasswordsMatch(formData.newPassword, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In this demo, we're just validating against mock data
      const foundUser = mockUserAccounts.find(u => u.id === currentUserId);
      
      if (!foundUser) {
        throw new Error('User not found');
      }
      
      // Simulate password check (in a real app, we'd use bcrypt to compare)
      const isCurrentPasswordValid = foundUser.passwordHash.includes(formData.currentPassword);
      
      if (!isCurrentPasswordValid) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        throw new Error('Current password is incorrect');
      }
      
      // Create audit log entry
      createAuditLog(
        currentUserId,
        'password_change',
        user?.id || currentUserId,
        'Password changed successfully'
      );
      
      // Success
      toast.success('Password changed successfully');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-4 flex items-center">
        <Lock className="h-5 w-5 text-amber-600 mr-2" />
        <h2 className="text-lg font-medium text-amber-800">Change Password</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current Password <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type={showCurrentPassword ? "text" : "password"}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className={`block w-full pr-10 focus:outline-none sm:text-sm rounded-md ${
                errors.currentPassword 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
              }`}
              placeholder="Enter your current password"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {errors.currentPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
          )}
        </div>
        
        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`block w-full pr-10 focus:outline-none sm:text-sm rounded-md ${
                errors.newPassword 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
              }`}
              placeholder="Enter your new password"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {errors.newPassword ? (
            <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
          ) : formData.newPassword && (
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
          
          {/* Password requirements */}
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500 font-medium">Password must contain:</p>
            <ul className="text-xs space-y-1">
              <li className="flex items-center">
                {formData.newPassword && formData.newPassword.length >= 8 
                  ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                At least 8 characters
              </li>
              <li className="flex items-center">
                {formData.newPassword && /[A-Z]/.test(formData.newPassword)
                  ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                At least 1 uppercase letter
              </li>
              <li className="flex items-center">
                {formData.newPassword && /[a-z]/.test(formData.newPassword)
                  ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                At least 1 lowercase letter
              </li>
              <li className="flex items-center">
                {formData.newPassword && /[0-9]/.test(formData.newPassword)
                  ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                At least 1 number
              </li>
              <li className="flex items-center">
                {formData.newPassword && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword)
                  ? <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  : <XCircle className="h-3 w-3 text-gray-300 mr-1" />}
                At least 1 special character
              </li>
            </ul>
          </div>
        </div>
        
        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`block w-full pr-10 focus:outline-none sm:text-sm rounded-md ${
                errors.confirmPassword 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
              }`}
              placeholder="Confirm your new password"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {errors.confirmPassword ? (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
          ) : (
            formData.confirmPassword && formData.newPassword && (
              <div className="mt-2 flex items-center">
                {doPasswordsMatch(formData.newPassword, formData.confirmPassword) ? (
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
        
        {/* Security Note */}
        <div className="bg-blue-50 rounded-md p-3 text-sm text-blue-700 flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
          <div>
            <p>For your security, we recommend using a unique password that you don't use for other websites.</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
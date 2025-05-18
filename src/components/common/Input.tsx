import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  isRequired?: boolean;
}

/**
 * Componente de input reutilizável
 * @component
 * @param {InputProps} props - Propriedades do componente
 * @returns {JSX.Element} Campo de entrada estilizado
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isFullWidth = true,
  isRequired = false,
  type = 'text',
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputId = id || React.useId();

  const baseInputStyles = `
    block rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500 sm:text-sm
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  const errorInputStyles = error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : '';
  const iconInputStyles = `${leftIcon ? 'pl-10' : ''} ${rightIcon || type === 'password' ? 'pr-10' : ''}`;
  const widthStyles = isFullWidth ? 'w-full' : '';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`${widthStyles} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{leftIcon}</span>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          disabled={disabled}
          className={`
            ${baseInputStyles}
            ${errorInputStyles}
            ${iconInputStyles}
            ${widthStyles}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {rightIcon && !type.includes('password') && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-500 sm:text-sm">{rightIcon}</span>
          </div>
        )}

        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-500" />
            )}
          </button>
        )}
      </div>

      {(error || helperText) && (
        <p
          id={error ? `${inputId}-error` : `${inputId}-helper`}
          className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 
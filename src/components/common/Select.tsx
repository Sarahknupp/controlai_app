// @ts-nocheck
import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Componente de select reutilizável
 * @component
 * @param {SelectProps} props - Propriedades do componente
 * @returns {JSX.Element} Campo de seleção estilizado
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  helperText,
  size = 'md',
  isFullWidth = true,
  isRequired = false,
  placeholder,
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || React.useId();

  const baseStyles = `
    block rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    appearance-none
  `;

  const sizeStyles = {
    sm: 'py-1.5 pl-3 pr-8 text-sm',
    md: 'py-2 pl-3 pr-8 text-sm',
    lg: 'py-2.5 pl-3 pr-8 text-base'
  };

  const errorStyles = error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : '';
  const widthStyles = isFullWidth ? 'w-full' : '';

  return (
    <div className={`${widthStyles} ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`
            ${baseStyles}
            ${sizeStyles[size]}
            ${errorStyles}
            ${widthStyles}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <ChevronDown className={`h-4 w-4 text-gray-400 ${disabled ? 'opacity-50' : ''}`} />
        </div>
      </div>

      {(error || helperText) && (
        <p
          id={error ? `${selectId}-error` : `${selectId}-helper`}
          className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select; 
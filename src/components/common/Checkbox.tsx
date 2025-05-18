import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  isIndeterminate?: boolean;
}

/**
 * Componente de checkbox reutilizável
 * @component
 * @param {CheckboxProps} props - Propriedades do componente
 * @returns {JSX.Element} Checkbox estilizado
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  helperText,
  isIndeterminate = false,
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || React.useId();

  React.useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, ref]);

  return (
    <div className={className}>
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            className={`
              h-4 w-4 rounded border-gray-300
              text-blue-600
              focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-300' : ''}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${checkboxId}-error` 
              : helperText ? `${checkboxId}-helper` 
              : undefined
            }
            {...props}
          />
          <div
            className={`
              absolute left-0 top-0 h-4 w-4
              flex items-center justify-center
              pointer-events-none
              ${props.checked || isIndeterminate ? 'text-white' : 'text-transparent'}
              ${disabled ? 'opacity-50' : ''}
            `}
          >
            {isIndeterminate ? (
              <div className="h-0.5 w-2 bg-current" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </div>
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label
              htmlFor={checkboxId}
              className={`
                font-medium text-gray-700
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {label}
            </label>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          id={error ? `${checkboxId}-error` : `${checkboxId}-helper`}
          className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox; 
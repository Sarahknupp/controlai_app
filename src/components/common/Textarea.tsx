import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isFullWidth?: boolean;
  isRequired?: boolean;
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
}

/**
 * Componente de textarea reutilizável
 * @component
 * @param {TextareaProps} props - Propriedades do componente
 * @returns {JSX.Element} Campo de texto multilinha estilizado
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  isFullWidth = true,
  isRequired = false,
  rows = 4,
  maxLength,
  showCharacterCount = false,
  disabled = false,
  className = '',
  id,
  value = '',
  onChange,
  ...props
}, ref) => {
  const textareaId = id || React.useId();
  const [currentLength, setCurrentLength] = React.useState(String(value).length);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentLength(e.target.value.length);
    onChange?.(e);
  };

  const baseStyles = `
    block w-full rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500 sm:text-sm
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    resize-none
  `;

  const errorStyles = error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : '';
  const widthStyles = isFullWidth ? 'w-full' : '';

  return (
    <div className={`${widthStyles} ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            ${baseStyles}
            ${errorStyles}
            ${widthStyles}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` 
            : helperText ? `${textareaId}-helper` 
            : showCharacterCount ? `${textareaId}-count`
            : undefined
          }
          value={value}
          onChange={handleChange}
          {...props}
        />

        {showCharacterCount && (
          <div
            id={`${textareaId}-count`}
            className="absolute bottom-2 right-2 text-xs text-gray-500"
          >
            {currentLength}
            {maxLength && ` / ${maxLength}`}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          id={error ? `${textareaId}-error` : `${textareaId}-helper`}
          className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea; 
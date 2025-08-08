// @ts-nocheck
import React, { forwardRef } from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string,
  error?: string,
  helperText?: string,
  className?: string,
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => (
    <div className={`flex flex-col ${className || ''}`}>
      {label && <label>{label}</label>}
      <textarea ref={ref} {...props} />
      {(error || helperText) && (
        <p className={error ? 'text-red-600' : 'text-gray-500'}>
          {error || helperText}
        </p>
      )}
    </div>
  )
); 
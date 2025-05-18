import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  isDot?: boolean;
  isOutline?: boolean;
  className?: string;
}

/**
 * Componente de badge para indicadores de status
 * @component
 * @param {BadgeProps} props - Propriedades do componente
 * @returns {JSX.Element} Badge estilizado
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isDot = false,
  isOutline = false,
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  };

  const variantStyles = {
    primary: isOutline
      ? 'border border-blue-500 text-blue-700 bg-blue-50'
      : 'bg-blue-100 text-blue-800',
    secondary: isOutline
      ? 'border border-gray-500 text-gray-700 bg-gray-50'
      : 'bg-gray-100 text-gray-800',
    success: isOutline
      ? 'border border-green-500 text-green-700 bg-green-50'
      : 'bg-green-100 text-green-800',
    danger: isOutline
      ? 'border border-red-500 text-red-700 bg-red-50'
      : 'bg-red-100 text-red-800',
    warning: isOutline
      ? 'border border-yellow-500 text-yellow-700 bg-yellow-50'
      : 'bg-yellow-100 text-yellow-800',
    info: isOutline
      ? 'border border-blue-500 text-blue-700 bg-blue-50'
      : 'bg-blue-100 text-blue-800'
  };

  const dotColors = {
    primary: 'bg-blue-400',
    secondary: 'bg-gray-400',
    success: 'bg-green-400',
    danger: 'bg-red-400',
    warning: 'bg-yellow-400',
    info: 'bg-blue-400'
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {isDot && (
        <span
          className={`
            h-2 w-2 rounded-full mr-2
            ${dotColors[variant]}
          `}
        />
      )}
      {icon && (
        <span className={`
          mr-1.5
          ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}
        `}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge; 
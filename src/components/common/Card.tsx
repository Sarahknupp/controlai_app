import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  noPadding?: boolean;
  isHoverable?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
}

/**
 * Componente de card reutilizável
 * @component
 * @param {CardProps} props - Propriedades do componente
 * @returns {JSX.Element} Container de conteúdo estilizado
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  footer,
  actions,
  className = '',
  padding = 'md',
  noPadding = false,
  isHoverable = false,
  isClickable = false,
  onClick
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const hoverStyles = isHoverable ? 'hover:shadow-md transition-shadow duration-200' : '';
  const clickableStyles = isClickable ? 'cursor-pointer' : '';
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={`
        ${baseStyles}
        ${hoverStyles}
        ${clickableStyles}
        ${paddingStyles[padding]}
        ${className}
      `}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Card Header */}
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && (
            typeof title === 'string' ? (
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            ) : (
              title
            )
          )}
          {description && (
            typeof description === 'string' ? (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            ) : (
              description
            )
          )}
          {actions && (
            <div className="mt-4 flex items-center justify-end space-x-3">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={!noPadding ? 'p-6' : ''}>
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 
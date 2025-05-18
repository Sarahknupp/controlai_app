import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  text?: string;
}

/**
 * Componente de indicador de carregamento
 * @component
 * @param {LoadingSpinnerProps} props - Propriedades do componente
 * @returns {JSX.Element} Spinner de carregamento animado
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false,
  size = 'md',
  overlay = false,
  text = 'Carregando...'
}) => {
  const spinnerSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinnerClasses = `
    animate-spin rounded-full 
    border-t-2 border-b-2 border-blue-500
    ${spinnerSizes[size]}
  `;

  const containerClasses = `
    flex flex-col items-center justify-center
    ${fullScreen ? 'h-screen' : 'h-full'}
    ${overlay ? 'fixed inset-0 bg-black bg-opacity-50 z-50' : ''}
  `;

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses} />
      {text && (
        <span className={`
          mt-4 text-sm font-medium
          ${overlay ? 'text-white' : 'text-gray-700'}
        `}>
          {text}
        </span>
      )}
      <span className="sr-only">Carregando...</span>
    </div>
  );
};

export default LoadingSpinner; 
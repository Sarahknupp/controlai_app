import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}

/**
 * Componente para exibição de estados de erro
 * @component
 * @param {ErrorStateProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente de estado de erro
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocorreu um erro',
  message = 'Não foi possível completar a operação solicitada.',
  onRetry,
  icon,
  action,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            {icon || <AlertTriangle className="h-5 w-5 text-red-400" />}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{message}</p>
            </div>
            {(onRetry || action) && (
              <div className="mt-4">
                {onRetry && (
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={onRetry}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Tentar novamente
                  </button>
                )}
                {action}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center">
        {icon || (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        )}
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {(onRetry || action) && (
        <div className="mt-6 flex justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  );
};

export default ErrorState; 
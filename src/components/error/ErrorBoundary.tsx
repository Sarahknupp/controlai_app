import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Componente de fallback para exibição de erros
 */
const ErrorFallback: React.FC<{ error: Error | null; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const navigate = useNavigate();

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Ops! Algo deu errado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error?.message || 'Ocorreu um erro inesperado na aplicação.'}
          </p>
          
          {/* Show stack trace in development */}
          {isDevelopment && error && (
            <div className="mt-4">
              <details className="text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 text-xs text-left text-red-600 bg-red-50 p-4 rounded-md overflow-auto">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={resetError}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar para o início
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          Se o problema persistir, entre em contato com o suporte técnico.
        </p>
      </div>
    </div>
  );
};

/**
 * Componente para tratamento de erros em nível de aplicação
 * @component
 * @extends {Component<Props, State>}
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro na aplicação:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Aqui você pode adicionar integração com serviços de monitoramento de erros
    // Por exemplo: Sentry, LogRocket, etc.
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
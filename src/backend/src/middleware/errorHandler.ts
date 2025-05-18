import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'API_001',
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  let response: ErrorResponse = {
    success: false,
    error: {
      code: 'API_001',
      message: 'Erro interno do servidor'
    }
  };

  if (err instanceof ApiError) {
    response = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Erros de validação do Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));

    response = {
      success: false,
      error: {
        code: 'VAL_001',
        message: 'Erro de validação',
        details
      }
    };
    res.status(400).json(response);
    return;
  }

  // Erro de ID inválido do Mongoose
  if (err instanceof mongoose.Error.CastError) {
    response = {
      success: false,
      error: {
        code: 'VAL_001',
        message: 'ID inválido',
        details: {
          field: err.path,
          value: err.value
        }
      }
    };
    res.status(400).json(response);
    return;
  }

  // Erro de chave duplicada do MongoDB
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    response = {
      success: false,
      error: {
        code: 'VAL_001',
        message: 'Valor duplicado',
        details: {
          field,
          message: `Já existe um registro com este ${field}`
        }
      }
    };
    res.status(400).json(response);
    return;
  }

  // Erro padrão
  res.status(500).json(response);
}; 
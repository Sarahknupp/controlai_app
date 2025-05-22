import { Response } from 'express';

export class AppError extends Error {
  status: number;
  errors?: any[];

  constructor(status: number, message: string, errors?: any[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'AppError';
  }
}

export const handleError = (error: any, res?: Response): void => {
  if (error instanceof AppError) {
    if (res) {
      res.status(error.status).json({
        status: 'error',
        message: error.message,
      });
    }
    return;
  }

  // Erro não operacional (erro de programação)
  console.error('Erro não operacional:', error);

  if (res) {
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  }
};

export const createError = (status: number, message: string, errors?: any[]): AppError => {
  return new AppError(status, message, errors);
};

export const isOperationalError = (error: any): boolean => {
  if (error instanceof AppError) {
    return true;
  }
  return false;
}; 
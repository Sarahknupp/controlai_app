import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    field?: string;
    code?: string;
  };
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error: ErrorResponse = {
    success: false,
    error: {
      message: err.message || 'Erro interno do servidor'
    }
  };

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    
    return res.status(400).json({
      success: false,
      errors: messages
    });
  }

  // Mongoose bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    error.error.message = `Recurso não encontrado com id ${err.value}`;
    error.error.code = 'INVALID_ID';
    return res.status(404).json(error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.error.message = 'Registro duplicado encontrado';
    error.error.code = 'DUPLICATE_ENTRY';
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error.message = 'Token de autenticação inválido';
    error.error.code = 'INVALID_TOKEN';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.error.message = 'Token de autenticação expirado';
    error.error.code = 'TOKEN_EXPIRED';
    return res.status(401).json(error);
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(error);
}; 
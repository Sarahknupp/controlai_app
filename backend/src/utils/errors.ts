// Base error class
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// 422 Unprocessable Entity
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

// 429 Too Many Requests
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too Many Requests') {
    super(message, 429);
  }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
} 
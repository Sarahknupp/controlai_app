export class ForbiddenError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
} 
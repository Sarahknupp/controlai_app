import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';

// Pagination interface
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Pagination middleware
export const pagination = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get pagination parameters from query
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const sort = req.query.sort as string;
    const order = (req.query.order as 'asc' | 'desc') || 'asc';

    // Validate sort field
    if (sort && !/^[a-zA-Z0-9_]+$/.test(sort)) {
      throw new Error('Invalid sort field');
    }

    // Validate order
    if (order && !['asc', 'desc'].includes(order)) {
      throw new Error('Invalid order');
    }

    // Add pagination options to request
    req.pagination = {
      page,
      limit,
      sort,
      order
    };

    // Add pagination headers to response
    res.setHeader('X-Page', page);
    res.setHeader('X-Limit', limit);
    res.setHeader('X-Total-Pages', 0); // Will be updated by the route handler
    res.setHeader('X-Total-Count', 0); // Will be updated by the route handler

    next();
  } catch (error) {
    logger.error('Pagination error', { error: (error as Error).message });
    next(error);
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationOptions;
    }
  }
}

// Pagination helper functions
export const paginationHelpers = {
  // Calculate skip value for database queries
  getSkip: (page: number, limit: number): number => {
    return (page - 1) * limit;
  },

  // Calculate total pages
  getTotalPages: (total: number, limit: number): number => {
    return Math.ceil(total / limit);
  },

  // Format pagination metadata
  formatPaginationMetadata: (total: number, page: number, limit: number) => {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  },

  // Format paginated response
  formatPaginatedResponse: <T>(data: T[], total: number, page: number, limit: number) => {
    return {
      data,
      pagination: paginationHelpers.formatPaginationMetadata(total, page, limit)
    };
  }
}; 
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User';
import { UserRole } from '../types/user.types';
import { UnauthorizedError, ForbiddenError } from '../errors/unauthorized.error';
import { ForbiddenError as ForbiddenErrorType } from '../errors/forbidden.error';
import { UserService } from '../services/user.service';
import { rateLimit } from 'express-rate-limit';
import { SecurityMonitorService } from '../services/security-monitor.service';
import { logger } from '../config/logger';
import { asyncHandler } from '../utils/asyncHandler';

// Extend Request type to include user
export interface AuthRequest extends Request {
  user: IUserDocument;
}

export interface AuthRequestWithParams<P extends Record<string, string> = Record<string, string>> extends AuthRequest {
  params: P;

}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const securityMonitor = SecurityMonitorService.getInstance();

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {

      user?: {
        _id: string;
        name: string;
        email: string;
        role: UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      };

    }
  }
}

// Rate limiter for login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Too many login attempts, please try again later',
  handler: (req: Request, res: Response) => {
    securityMonitor.logRateLimitExceeded(req);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later'
    });
  }
});

// Protect routes

export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.active) {
      throw new UnauthorizedError('Not authorized to access this route');
    }
    
    req.user = user;
    next();
  } catch (error) {
    throw new UnauthorizedError('Not authorized to access this route');
  }
});


// Middleware para autorização por role
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Require email verification
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  if (!authReq.user.isEmailVerified) {
    securityMonitor.logSecurityEvent('UNVERIFIED_EMAIL', {
      path: req.path,
      userId: authReq.user._id
    });
    throw new ForbiddenErrorType('Email verification required');
  }
  next();
};

// Validate ObjectId middleware
export const validateObjectId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    securityMonitor.logSecurityEvent('INVALID_OBJECT_ID', {
      path: req.path,
      id: req.params.id
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
});

// Export authenticateToken function
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  // validação do token (JWT.verify, etc.)
  next();
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      _id: string;
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      _id: string;
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      exp: number;
    };

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      throw new UnauthorizedError('Token expired');
    }

    req.user = {
      _id: decoded._id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      isActive: decoded.isActive,
      createdAt: decoded.createdAt,
      updatedAt: decoded.updatedAt
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.headers['x-refresh-token'] as string;

    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
      _id: string;
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };

    // Generate new access token
    const accessToken = jwt.sign(
      {
        _id: decoded._id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        isActive: decoded.isActive,
        createdAt: decoded.createdAt,
        updatedAt: decoded.updatedAt
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.setHeader('x-access-token', accessToken);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid refresh token'));
    } else {
      next(error);
    }
  }
};

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedError('No API key provided');
    }

    if (apiKey !== process.env.API_KEY) {
      logger.warn('Invalid API key attempt', {
        providedKey: apiKey,
        path: req.path,
        method: req.method
      });

      throw new UnauthorizedError('Invalid API key');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateRateLimit = (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip;
    const key = `rate-limit:${ip}`;
    const limit = 100; // requests per minute
    const window = 60; // seconds

    // TODO: Implement rate limiting logic using Redis or similar
    // For now, just pass through
    next();
  } catch (error) {
    next(error);
  }
};

export const validateCors = (req: Request, res: Response, next: NextFunction) => {
  try {
    const origin = req.headers.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

    if (origin && !allowedOrigins.includes(origin)) {
      logger.warn('CORS violation attempt', {
        origin,
        allowedOrigins,
        path: req.path,
        method: req.method
      });

      throw new ForbiddenErrorType('CORS not allowed');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.headers['content-type'];

      if (!contentType || !contentType.includes('application/json')) {
        throw new UnauthorizedError('Content-Type must be application/json');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  try {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSize = 1024 * 1024; // 1MB

    if (contentLength > maxSize) {
      throw new UnauthorizedError('Request entity too large');
    }

    next();
  } catch (error) {
    next(error);
  }
}; 


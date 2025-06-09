import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole, IUser } from '../models/User';
import { UnauthorizedError } from '../utils/errors';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Protect routes
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

// Grant access to specific roles
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized to access this route');
    }

    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(`User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

// Validate ObjectId middleware
export const validateObjectId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    throw new UnauthorizedError('Invalid ID format');
  }
  next();
});

export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('No authorization header');
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    throw new UnauthorizedError('Invalid authorization header format');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    const userService = new UserService();
    const user = await userService.getUserById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
}); 
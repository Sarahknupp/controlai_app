import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole, IUser } from '../models/User';
import { UnauthorizedError } from '../utils/errors';
import { UserService } from '../services/user.service';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Protect routes
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
    if (err || !decoded) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.active) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error'
      });
    }
  });
};

// Grant access to specific roles
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Validate ObjectId middleware
export const validateObjectId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    const userService = new UserService();
    const user = await userService.getUserById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
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
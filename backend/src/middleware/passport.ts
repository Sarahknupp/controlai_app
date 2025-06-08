import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { logger } from './logging';

// Passport options interface
interface PassportOptions {
  secretOrKey?: string;
  jwtFromRequest?: any;
  localStrategy?: {
    usernameField?: string;
    passwordField?: string;
  };
  jwtStrategy?: {
    secretOrKey?: string;
    jwtFromRequest?: any;
    issuer?: string;
    audience?: string;
  };
}

// Default passport options
const defaultOptions: PassportOptions = {
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  localStrategy: {
    usernameField: 'email',
    passwordField: 'password'
  },
  jwtStrategy: {
    secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    issuer: 'api',
    audience: 'users'
  }
};

// Passport middleware factory
export const createPassportMiddleware = (options: PassportOptions = {}) => {
  const passportOptions = { ...defaultOptions, ...options };

  // Configure local strategy
  passport.use(new LocalStrategy(
    {
      usernameField: passportOptions.localStrategy!.usernameField,
      passwordField: passportOptions.localStrategy!.passwordField
    },
    async (username: string, password: string, done: any) => {
      try {
        // Find user by username
        const user = await User.findOne({ email: username });

        // Check if user exists
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        // Check if password is valid
        const isValid = await user.comparePassword(password);
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Configure JWT strategy
  passport.use(new JwtStrategy(
    {
      secretOrKey: passportOptions.jwtStrategy!.secretOrKey,
      jwtFromRequest: passportOptions.jwtStrategy!.jwtFromRequest,
      issuer: passportOptions.jwtStrategy!.issuer,
      audience: passportOptions.jwtStrategy!.audience
    },
    async (payload: any, done: any) => {
      try {
        // Find user by id
        const user = await User.findById(payload.sub);

        // Check if user exists
        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  ));

  // Serialize user
  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id: string, done: any) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  return passport.initialize();
};

// Passport helper functions
export const passportHelpers = {
  // Get passport secret or key
  getPassportSecretOrKey: (): string => {
    return defaultOptions.secretOrKey!;
  },

  // Get passport JWT from request
  getPassportJwtFromRequest: (): any => {
    return defaultOptions.jwtFromRequest;
  },

  // Get passport local strategy
  getPassportLocalStrategy: (): any => {
    return defaultOptions.localStrategy;
  },

  // Get passport JWT strategy
  getPassportJwtStrategy: (): any => {
    return defaultOptions.jwtStrategy;
  }
}; 
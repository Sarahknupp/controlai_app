const authorize = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return next({
        status: 401,
        message: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return next({
        status: 403,
        message: 'Forbidden'
      });
    }

    next();
  };
};

const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next({
      status: 401,
      message: 'No token provided'
    });
  }

  try {
    // Mock user for testing
    req.user = {
      id: 1,
      email: 'test@example.com',
      role: 'user'
    };
    next();
  } catch (error) {
    next({
      status: 401,
      message: 'Invalid token'
    });
  }
};

export { authorize, authenticate }; 
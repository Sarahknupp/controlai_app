import { Request, Response } from 'express';
import { User, UserRole, IUser } from '../models/User';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import crypto from 'crypto';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to generate JWT token
const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Private/Admin
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError('User already exists');
  }

  // Create user
  const user = await User.create(req.body);

  // Generate token
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  // Check for user
  const user = await User.findOne({ email, active: true });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    throw new UnauthorizedError('Not authorized');
  }

  const foundUser = await User.findById(req.user._id).select('-password');
  if (!foundUser) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: foundUser
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    throw new UnauthorizedError('Not authorized');
  }

  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: updatedUser
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    throw new UnauthorizedError('Not authorized');
  }

  const foundUser = await User.findById(req.user._id);
  if (!foundUser) {
    throw new NotFoundError('User not found');
  }

  // Check current password
  const isMatch = await foundUser.comparePassword(req.body.currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  foundUser.password = req.body.newPassword;
  await foundUser.save();

  // Generate new token
  const token = generateToken(foundUser);

  res.json({
    success: true,
    data: {
      token
    }
  });
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find().select('-password');

  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/auth/users/:id
// @access  Private/Admin
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError('No user with that email');
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send email with reset token
  // For now, just return the token in development
  res.json({
    success: true,
    data: {
      message: 'Password reset token generated',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    }
  });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate new token
  const newToken = generateToken(user);

  res.json({
    success: true,
    data: {
      token: newToken
    }
  });
});
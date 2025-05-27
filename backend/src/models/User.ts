import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IUser, UserRole } from '../types/user';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  password: string;
  twoFactorSecret?: string;
  loginAttempts: number;
  lockUntil?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  isEmailVerified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isLocked(): boolean;
  generatePasswordResetToken(): Promise<string>;
  generateEmailVerificationToken(): Promise<string>;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Nome deve ter no mínimo 2 caracteres'],
    maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true
  },
  document: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String
  },
  preferences: {
    language: {
      type: String,
      default: 'pt-BR'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to generate JWT token
userSchema.methods.getSignedJwtToken = function(): string {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1d' }
  );
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // If we have a previous lock that has expired, reset at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  // Otherwise we're incrementing
  const updates: { $inc: { loginAttempts: number }; $set?: { lockUntil: Date } } = { $inc: { loginAttempts: 1 } };
  // Lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 hours
  }
  await this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 }
  });
};

// Method to check if account is locked
userSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = async function(): Promise<string> {
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await this.save();

  return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = async function(): Promise<string> {
  // Generate token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire
  this.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await this.save();

  return verificationToken;
};

export const User = mongoose.model<IUserDocument>('User', userSchema); 
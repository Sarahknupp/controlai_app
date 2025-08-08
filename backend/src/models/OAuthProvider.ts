import mongoose, { Document, Schema } from 'mongoose';

export interface IOAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface IOAuthProviderDocument extends IOAuthProvider, Document {}

const oauthProviderSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['google', 'github', 'microsoft', 'azure']
  },
  clientId: {
    type: String,
    required: true
  },
  clientSecret: {
    type: String,
    required: true,
    select: false
  },
  redirectUri: {
    type: String,
    required: true
  },
  scope: [{
    type: String,
    required: true
  }],
  authUrl: {
    type: String,
    required: true
  },
  tokenUrl: {
    type: String,
    required: true
  },
  userInfoUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

export const OAuthProvider = mongoose.model<IOAuthProviderDocument>('OAuthProvider', oauthProviderSchema);
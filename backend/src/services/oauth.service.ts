import crypto from 'crypto';
import { User, IUserDocument } from '../models/User';
import { OAuthProvider, IOAuthProviderDocument } from '../models/OAuthProvider';

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  verified?: boolean;
}

export class OAuthService {
  private stateStore: Map<string, { provider: string; timestamp: number }>;

  constructor() {
    this.stateStore = new Map();
  }

  async getAuthorizationUrl(providerName: string): Promise<string> {
    const provider = await OAuthProvider.findOne({ 
      name: providerName, 
      isActive: true 
    });

    if (!provider) {
      throw new Error(`OAuth provider '${providerName}' not found`);
    }

    const state = this.generateSecureState();
    this.stateStore.set(state, {
      provider: providerName,
      timestamp: Date.now()
    });

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      response_type: 'code',
      scope: provider.scope.join(' '),
      state
    });

    return `${provider.authUrl}?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<{ user: any; isNewUser: boolean }> {
    const stateData = this.stateStore.get(state);
    if (!stateData) {
      throw new Error('Invalid OAuth state');
    }

    const provider = await OAuthProvider.findOne({ 
      name: stateData.provider, 
      isActive: true 
    });

    if (!provider) {
      throw new Error('OAuth provider not found');
    }

    const tokenResponse = await this.exchangeCodeForToken(provider, code);
    const userInfo = await this.getUserInfo(provider, tokenResponse.access_token);
    const { user, isNewUser } = await this.findOrCreateUser(provider, userInfo);

    return { user, isNewUser };
  }

  private async exchangeCodeForToken(provider: IOAuthProviderDocument, code: string): Promise<OAuthTokenResponse> {
    const params = new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: provider.redirectUri
    });

    const response = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async getUserInfo(provider: IOAuthProviderDocument, accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch(provider.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalizeUserInfo(provider.name, data);
  }

  private normalizeUserInfo(providerName: string, data: any): OAuthUserInfo {
    switch (providerName) {
      case 'google':
        return {
          id: data.sub,
          email: data.email,
          name: data.name,
          avatar: data.picture,
          verified: data.email_verified
        };
      case 'github':
        return {
          id: data.id.toString(),
          email: data.email,
          name: data.name || data.login,
          avatar: data.avatar_url,
          verified: true
        };
      default:
        throw new Error(`Unsupported OAuth provider: ${providerName}`);
    }
  }

  private async findOrCreateUser(provider: IOAuthProviderDocument, userInfo: OAuthUserInfo): Promise<{ user: IUserDocument; isNewUser: boolean }> {
    let user = await User.findOne({
      'oauthProviders.provider': provider.name,
      'oauthProviders.providerId': userInfo.id
    });

    if (user) {
      return { user, isNewUser: false };
    }

    user = await User.findOne({ email: userInfo.email });

    if (user) {
      user.oauthProviders.push({
        provider: provider.name,
        providerId: userInfo.id,
        email: userInfo.email,
        connectedAt: new Date(),
        metadata: { name: userInfo.name, avatar: userInfo.avatar }
      });
      await user.save();
      return { user, isNewUser: false };
    }

    const newUser = await User.create({
      name: userInfo.name,
      email: userInfo.email,
      authMethod: 'oauth',
      isEmailVerified: userInfo.verified || false,
      oauthProviders: [{
        provider: provider.name,
        providerId: userInfo.id,
        email: userInfo.email,
        connectedAt: new Date(),
        metadata: { name: userInfo.name, avatar: userInfo.avatar }
      }]
    });

    return { user: newUser, isNewUser: true };
  }

  private generateSecureState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async getAvailableProviders(): Promise<IOAuthProviderDocument[]> {
    return OAuthProvider.find({ isActive: true }).select('-clientSecret');
  }
}
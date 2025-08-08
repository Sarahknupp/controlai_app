import { Request, Response } from 'express';
import { OAuthService } from '../services/oauth.service';

export class OAuthController {
  private oauthService: OAuthService;

  constructor() {
    this.oauthService = new OAuthService();
  }

  authorize = async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const authUrl = await this.oauthService.getAuthorizationUrl(provider);

      res.json({
        success: true,
        data: { authUrl, provider }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to generate authorization URL'
      });
    }
  };

  callback = async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;

      if (!code || !state) {
        return res.status(400).json({
          success: false,
          message: 'Missing authorization code or state parameter'
        });
      }

      const result = await this.oauthService.handleCallback(
        code as string,
        state as string
      );

      res.json({
        success: true,
        data: {
          user: result.user,
          isNewUser: result.isNewUser
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'OAuth authentication failed'
      });
    }
  };

  getProviders = async (req: Request, res: Response) => {
    try {
      const providers = await this.oauthService.getAvailableProviders();
      const providersData = providers.map(provider => ({
        name: provider.name,
        scope: provider.scope,
        isActive: provider.isActive
      }));

      res.json({
        success: true,
        data: providersData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get OAuth providers'
      });
    }
  };
}

export const oauthController = new OAuthController();
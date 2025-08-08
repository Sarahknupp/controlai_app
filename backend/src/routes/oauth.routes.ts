import { Router } from 'express';
import { param } from 'express-validator';
import { oauthController } from '../controllers/oauth.controller';

const router = Router();

const validateProvider = param('provider')
  .isIn(['google', 'github', 'microsoft', 'azure'])
  .withMessage('Invalid OAuth provider');

router.get('/providers', oauthController.getProviders);
router.get('/:provider/authorize', validateProvider, oauthController.authorize);
router.get('/callback', oauthController.callback);

export default router;
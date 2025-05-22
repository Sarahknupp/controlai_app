import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { applyDocsMiddleware } from '../docs';

// Mock swagger-ui-express
jest.mock('swagger-ui-express', () => ({
  serve: jest.fn(),
  setup: jest.fn(),
}));

describe('Documentation Middleware', () => {
  let mockApp: Express;
  let mockUse: jest.Mock;
  let mockGet: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Express app
    mockUse = jest.fn();
    mockGet = jest.fn();
    mockApp = {
      use: mockUse,
      get: mockGet,
    } as unknown as Express;
  });

  describe('applyDocsMiddleware', () => {
    it('should set up Swagger UI documentation', () => {
      // Apply middleware
      applyDocsMiddleware(mockApp);

      // Verify Swagger UI setup
      expect(mockUse).toHaveBeenCalledWith('/api-docs', expect.any(Function), expect.any(Function));
      expect(swaggerUi.serve).toHaveBeenCalled();
      expect(swaggerUi.setup).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          explorer: true,
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: 'Control AI Vendas API Documentation',
        })
      );
    });

    it('should set up Swagger JSON endpoint', () => {
      // Apply middleware
      applyDocsMiddleware(mockApp);

      // Verify JSON endpoint setup
      expect(mockGet).toHaveBeenCalledWith('/api-docs.json', expect.any(Function));

      // Get the route handler
      const routeHandler = mockGet.mock.calls[0][1];

      // Create mock response
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      // Call the route handler
      routeHandler({}, mockResponse);

      // Verify response headers and content
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(Object));
    });
  });
}); 
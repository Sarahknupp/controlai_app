import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { logger } from './logging';

// Swagger options interface
interface SwaggerOptions {
  definition?: {
    openapi?: string;
    info?: {
      title?: string;
      version?: string;
      description?: string;
      license?: {
        name?: string;
        url?: string;
      };
      contact?: {
        name?: string;
        url?: string;
        email?: string;
      };
    };
    servers?: {
      url?: string;
      description?: string;
    }[];
    components?: {
      securitySchemes?: {
        [key: string]: {
          type?: string;
          scheme?: string;
          bearerFormat?: string;
        };
      };
    };
    security?: {
      [key: string]: string[];
    }[];
  };
  apis?: string[];
  swaggerOptions?: {
    explorer?: boolean;
    customCss?: string;
    customSiteTitle?: string;
    customfavIcon?: string;
  };
}

// Default swagger options
const defaultOptions: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for the application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      contact: {
        name: 'API Support',
        url: 'https://www.example.com/support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'],
  swaggerOptions: {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation',
    customfavIcon: '/favicon.ico'
  }
};

// Swagger middleware factory
export const createSwaggerMiddleware = (options: SwaggerOptions = {}) => {
  const swaggerOptions = { ...defaultOptions, ...options };

  // Generate swagger documentation
  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  // Serve swagger documentation
  return [
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerOptions.swaggerOptions)
  ];
};

// Swagger helper functions
export const swaggerHelpers = {
  // Get swagger definition
  getSwaggerDefinition: (): any => {
    return defaultOptions.definition;
  },

  // Get swagger APIs
  getSwaggerApis: (): string[] => {
    return defaultOptions.apis!;
  },

  // Get swagger options
  getSwaggerOptions: (): any => {
    return defaultOptions.swaggerOptions;
  }
}; 
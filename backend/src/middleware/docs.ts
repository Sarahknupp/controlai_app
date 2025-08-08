import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from '../utils/logger';
import path from 'path';

// Swagger options
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ControlAI API',
      version: '1.0.0',
      description: 'API documentation for ControlAI'
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            pages: {
              type: 'integer',
              example: 10,
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              example: 'user',
            },
            active: {
              type: 'boolean',
              example: true,
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Product Name',
            },
            description: {
              type: 'string',
              example: 'Product description',
            },
            price: {
              type: 'number',
              example: 99.99,
            },
            stock: {
              type: 'integer',
              example: 100,
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product',
              },
            },
            total: {
              type: 'number',
              example: 299.97,
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'cancelled'],
              example: 'pending',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts']
};

// Generate Swagger documentation
const swaggerSpec = swaggerJsdoc(options);

// Apply documentation middleware to Express app
export const applyDocsMiddleware = (app: Express): void => {
  try {
    // Serve API documentation
    app.use('/api-docs', (req, res, next) => {
      res.sendFile(path.join(__dirname, '../docs/index.html'));
    });

    // Serve OpenAPI specification
    app.use('/api-spec', (req, res, next) => {
      res.sendFile(path.join(__dirname, '../docs/openapi.json'));
    });

    logger.info('Documentation middleware applied successfully');
  } catch (error) {
    logger.error('Error applying documentation middleware:', error);
    throw error;
  }
};

// Swagger decorators
export const swaggerDecorators = {
  /**
   * @swagger
   * components:
   *   schemas:
   *     Error:
   *       type: object
   *       properties:
   *         success:
   *           type: boolean
   *           example: false
   *         message:
   *           type: string
   *           example: Error message
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     Pagination:
   *       type: object
   *       properties:
   *         page:
   *           type: integer
   *           example: 1
   *         limit:
   *           type: integer
   *           example: 10
   *         total:
   *           type: integer
   *           example: 100
   *         pages:
   *           type: integer
   *           example: 10
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     User:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           example: 507f1f77bcf86cd799439011
   *         name:
   *           type: string
   *           example: John Doe
   *         email:
   *           type: string
   *           example: john@example.com
   *         role:
   *           type: string
   *           enum: [admin, user]
   *           example: user
   *         active:
   *           type: boolean
   *           example: true
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     Product:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           example: 507f1f77bcf86cd799439011
   *         name:
   *           type: string
   *           example: Product Name
   *         description:
   *           type: string
   *           example: Product description
   *         price:
   *           type: number
   *           example: 99.99
   *         stock:
   *           type: integer
   *           example: 100
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     Order:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           example: 507f1f77bcf86cd799439011
   *         user:
   *           $ref: '#/components/schemas/User'
   *         products:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/Product'
   *         total:
   *           type: number
   *           example: 299.97
   *         status:
   *           type: string
   *           enum: [pending, processing, completed, cancelled]
   *           example: pending
   */
}; 
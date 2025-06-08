import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../package.json';

// Swagger options
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ControlAI API',
      version: '1.0.0',
      description: 'API documentation for ControlAI',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
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
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

// Generate Swagger documentation
const swaggerSpec = swaggerJsdoc(options);

// Apply documentation middleware to Express app
export const setupSwagger = (app: Express) => {
  // Serve Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
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
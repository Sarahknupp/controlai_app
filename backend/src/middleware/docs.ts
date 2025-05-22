import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../package.json';

// Swagger options
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Control AI Vendas API',
      version,
      description: 'API documentation for Control AI Vendas application',
      contact: {
        name: 'API Support',
        email: 'support@controlaivendas.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

// Generate Swagger documentation
const swaggerSpec = swaggerJsdoc(options);

// Apply documentation middleware to Express app
export const applyDocsMiddleware = (app: Express) => {
  // Serve Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Control AI Vendas API Documentation',
  }));

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
   *         status:
   *           type: string
   *           example: error
   *         message:
   *           type: string
   *           example: Error message
   *         errors:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               field:
   *                 type: string
   *                 example: fieldName
   *               message:
   *                 type: string
   *                 example: Error message
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
   *           example: 123e4567-e89b-12d3-a456-426614174000
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
   *         createdAt:
   *           type: string
   *           format: date-time
   *           example: 2024-01-01T00:00:00.000Z
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           example: 2024-01-01T00:00:00.000Z
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
   *           example: 123e4567-e89b-12d3-a456-426614174000
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
   *         category:
   *           type: string
   *           example: Electronics
   *         active:
   *           type: boolean
   *           example: true
   *         createdAt:
   *           type: string
   *           format: date-time
   *           example: 2024-01-01T00:00:00.000Z
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           example: 2024-01-01T00:00:00.000Z
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
   *           example: 123e4567-e89b-12d3-a456-426614174000
   *         userId:
   *           type: string
   *           example: 123e4567-e89b-12d3-a456-426614174000
   *         items:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               productId:
   *                 type: string
   *                 example: 123e4567-e89b-12d3-a456-426614174000
   *               quantity:
   *                 type: integer
   *                 example: 2
   *               price:
   *                 type: number
   *                 example: 99.99
   *         total:
   *           type: number
   *           example: 199.98
   *         status:
   *           type: string
   *           enum: [pending, processing, completed, cancelled]
   *           example: pending
   *         createdAt:
   *           type: string
   *           format: date-time
   *           example: 2024-01-01T00:00:00.000Z
   *         updatedAt:
   *           type: string
   *           format: date-time
   *           example: 2024-01-01T00:00:00.000Z
   */
}; 
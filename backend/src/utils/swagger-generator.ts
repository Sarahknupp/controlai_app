import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

const options = {
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
    },
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const outputPath = path.join(__dirname, '../../docs/swagger.json');

try {
  const swaggerSpec = swaggerJsdoc(options);
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
  console.log('Swagger documentation generated successfully!');
} catch (error) {
  console.error('Error generating Swagger documentation:', error);
  process.exit(1);
} 
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ControlAI Vendas is a comprehensive sales management system built as a full-stack application with React/TypeScript frontend and Node.js/Express backend. It features Point of Sale (PDV), inventory management, accounting, production control, reporting, and user management with security features including JWT authentication, rate limiting, and audit logging.

## Architecture

### Monorepo Structure
- `backend/` - Express.js API server with TypeScript
- `frontend/` - React/Vite application (legacy structure in root)
- `src/` - Legacy frontend code (being phased out)
- `docs/` - API and development documentation

### Database & External Services
- **MongoDB** with Mongoose ODM for data persistence
- **Redis** for caching and session management (via ioredis)
- **Tesseract.js** for OCR functionality
- **Puppeteer** for PDF generation
- **NodeMailer** for email notifications
- **Winston** for logging with daily log rotation
- **Bull** for job queues

### Key Features
- Multi-module business system (Sales, Inventory, Accounting, Production)
- OCR for product import from images
- JWT authentication with role-based access control
- Real-time notifications and audit logging  
- PDF generation for receipts and reports
- Email integration with templates
- Rate limiting and security middleware
- Comprehensive test coverage with Jest

## Development Commands

### Root Level (Full-Stack)
```bash
npm run dev          # Start both frontend and backend in development
npm run build        # Build TypeScript backend and Vite frontend
npm test             # Run all tests (backend and frontend)
npm run test:coverage # Run tests with coverage report
npm run lint         # Lint all TypeScript files
npm run lint:fix     # Fix linting issues automatically
npm run format       # Format code with Prettier
```

### Backend (from backend/ directory)
```bash
npm run dev          # Start backend with nodemon (auto-reload)
npm run build        # Compile TypeScript to dist/
npm run start        # Start production server from dist/
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:ci      # Run tests for CI (no watch, with coverage)
npm run lint         # ESLint TypeScript files
```

### Frontend Development
The project uses Vite for the frontend build system with proxy configuration to backend on port 4000.

```bash
# Frontend runs on port 3000 with API proxy to localhost:4000
# Uses Material-UI (MUI) for components
# TypeScript with strict mode enabled
```

## Testing Strategy

### Backend Testing
- **Framework**: Jest with ts-jest for TypeScript support
- **Database**: MongoDB Memory Server for isolated tests
- **Structure**: Tests in `__tests__` directories alongside source files
- **Coverage**: Configured to exclude node_modules, dist, and test files
- **Timeout**: 60 seconds for integration tests

### Test Commands
```bash
npm run test:watch    # Watch mode for development  
npm run test:coverage # Generate coverage reports
npm run test:ci       # CI mode with coverage
```

### Test File Patterns
- Unit tests: `*.test.ts` in `__tests__` directories
- Integration tests: `tests/integration/`  
- Performance tests: `tests/performance/`

## TypeScript Configuration

### Path Aliases (Consistent across frontend/backend)
```typescript
@/*           -> src/*
@components/* -> src/components/*
@services/*   -> src/services/*  
@types/*      -> src/types/*
@utils/*      -> src/utils/*
@hooks/*      -> src/hooks/* (frontend)
@config/*     -> src/config/*
```

### Backend: CommonJS modules, strict TypeScript
### Frontend: ESNext modules, React JSX, bundler resolution

## Key Directories

### Backend Structure
- `src/controllers/` - Route handlers and business logic
- `src/services/` - Core business services and external integrations  
- `src/models/` - Mongoose schemas and data models
- `src/middleware/` - Express middleware (auth, validation, logging)
- `src/routes/` - Express route definitions
- `src/utils/` - Utility functions and helpers
- `src/config/` - Configuration files and setup
- `src/types/` - TypeScript type definitions
- `src/templates/` - Email templates (Handlebars)

### Frontend Structure  
- `src/components/` - Reusable React components (organized by domain)
- `src/pages/` - Page components for different modules
- `src/services/` - API service layers and HTTP clients
- `src/hooks/` - Custom React hooks
- `src/context/` - React context providers
- `src/types/` - TypeScript interfaces and types

## Authentication & Security

The application implements comprehensive security:
- JWT tokens with role-based access control (admin, manager, user)
- Rate limiting by IP address
- MongoDB query sanitization  
- Helmet for security headers
- CORS configuration
- Input validation with express-validator
- Audit logging for sensitive operations

## Environment Setup

Required environment variables (create .env files):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)
- Backend runs on port 5000 (configurable via PORT)
- Frontend proxy configured for localhost:4000 API

## Build & Deployment

### Production Build
```bash
npm run build  # Compiles backend TypeScript and builds frontend
```

### Docker Support
- `docker-compose.yml` available for containerized deployment
- Separate Dockerfiles in frontend/ and backend/ directories
- Production-ready with multi-stage builds

## Common Development Patterns

### API Routes Pattern
All routes follow RESTful conventions with middleware chains:
```typescript
router.get('/', protect, authorize(['admin']), controller.getAll);
```

### Service Layer Pattern
Controllers delegate business logic to services:
```typescript
// Controller calls service
const result = await productService.createProduct(data);
```

### Error Handling
Centralized error handling with custom error classes and middleware.

### Validation
Request validation using express-validator with reusable validation schemas.

When working on this codebase, ensure you understand the monorepo structure and run commands from the appropriate directory level.
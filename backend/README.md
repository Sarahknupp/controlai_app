# ControlAI Vendas - Backend API

A robust sales management system backend built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🔐 Authentication & Authorization
  - JWT-based authentication
  - Role-based access control (Admin, Manager, User)
  - Password encryption
  - Session management

- 👥 User Management
  - User registration and login
  - Profile management
  - Password updates
  - Role-based permissions

- 📦 Product Management
  - Complete CRUD operations
  - Stock management
  - Low stock alerts
  - Product categorization
  - Image handling
  - SKU and barcode support

- 💰 Sales Management
  - Create sales with multiple items
  - Automatic stock updates
  - Multiple payment methods
  - Payment tracking
  - Sale cancellation with stock restoration
  - Sales statistics and reporting

- 🏢 Customer Management
  - Customer profiles
  - Multiple addresses
  - Purchase history
  - Credit limit management
  - Payment terms

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Express Middleware
  - Helmet (Security)
  - CORS
  - Rate Limiting
  - Request Sanitization
  - Compression
  - Morgan (Logging)

## Prerequisites

- Node.js >= 14.0.0
- MongoDB >= 4.4
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/controlai_vendas
   JWT_SECRET=your-secret-key
   JWT_EXPIRE=24h
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Documentation

### Authentication Endpoints

- POST `/api/auth/register` - Register new user (Admin only)
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/updatedetails` - Update user details
- PUT `/api/auth/updatepassword` - Update password

### Product Endpoints

- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (Admin/Manager)
- PUT `/api/products/:id` - Update product (Admin/Manager)
- DELETE `/api/products/:id` - Delete product (Admin/Manager)
- PATCH `/api/products/:id/stock` - Update stock (Admin/Manager)
- GET `/api/products/low-stock` - Get low stock products

### Customer Endpoints

- GET `/api/customers` - Get all customers
- GET `/api/customers/:id` - Get single customer
- POST `/api/customers` - Create customer
- PUT `/api/customers/:id` - Update customer
- DELETE `/api/customers/:id` - Delete customer
- GET `/api/customers/:id/purchases` - Get customer purchase history

### Sales Endpoints

- GET `/api/sales` - Get all sales
- GET `/api/sales/:id` - Get single sale
- POST `/api/sales` - Create sale
- PATCH `/api/sales/:id/cancel` - Cancel sale
- POST `/api/sales/:id/payments` - Add payment
- GET `/api/sales/stats` - Get sales statistics

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security

- JWT authentication
- Password hashing with bcrypt
- Request rate limiting
- MongoDB query sanitization
- Security headers with Helmet
- CORS configuration
- Input validation
- Error handling

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

## Project Structure

```
src/
├── app.ts              # App entry point
├── models/             # Database models
├── controllers/        # Route controllers
├── routes/            # API routes
├── middleware/        # Custom middleware
└── config/           # Configuration files
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 
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

# Controlai ERP - Backend

Backend do sistema ERP desenvolvido com Node.js, TypeScript e Express.

## 🚀 Desenvolvimento

### Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- MongoDB 6.x ou superior

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

### Executando o Projeto

Para iniciar o ambiente de desenvolvimento:

```bash
npm run dev
```

Este comando irá:
- Iniciar o servidor na porta 5000
- Habilitar hot-reload para desenvolvimento
- Compilar TypeScript automaticamente

### Convenções de Rotas

O projeto segue um padrão consistente para definição de rotas:

1. **Nomenclatura de Parâmetros**:
   - Use nomes descritivos para parâmetros de rota
   - Exemplo: `:userId` em vez de `:id`
   - Padrão: `:resourceId` (ex: `:productId`, `:saleId`, `:customerId`)

2. **Validação**:
   - Todas as rotas devem incluir validação de parâmetros
   - Use schemas de validação para `params`, `query` e `body`
   - Exemplo:
   ```typescript
   const userIdSchema = {
     params: {
       userId: { type: 'number', required: true, min: 1 }
     }
   };
   ```

3. **Estrutura de Rotas**:
   - Base routes: operações CRUD básicas
   - Specific routes: operações específicas do recurso
   - Exemplo:
   ```typescript
   // Base routes
   router.get('/', getUsers);
   router.post('/', createUser);

   // Specific routes
   router.get('/:userId', getUser);
   router.put('/:userId', updateUser);
   ```

4. **Autenticação e Autorização**:
   - Use middleware `protect` para rotas autenticadas
   - Use middleware `authorize` para controle de acesso
   - Exemplo:
   ```typescript
   router.use(protect);
   router.use(authorize([UserRole.ADMIN]));
   ```

### Testes

Para executar os testes:

```bash
npm test              # Executa todos os testes
npm run test:watch    # Executa testes em modo watch
npm run test:coverage # Executa testes com relatório de cobertura
```

### Deploy

Para fazer deploy da aplicação:

```bash
npm run deploy        # Deploy em produção
npm run deploy:staging # Deploy em staging
npm run deploy:preview # Deploy em preview
```

## 📝 Notas de Atualização

### Rotas Normalizadas
- Removidos protocolos e domínios das rotas
- Corrigidos parâmetros inválidos em todas as rotas
- Implementada validação consistente para parâmetros
- Padronizada nomenclatura de parâmetros
- Adicionados testes para verificar comportamento de rotas inválidas

### Melhorias Recentes
- Adicionados testes para tratamento de rotas inválidas
- Implementada validação robusta de parâmetros
- Padronizada estrutura de rotas em todo o projeto
- Melhorada documentação de rotas e convenções

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 
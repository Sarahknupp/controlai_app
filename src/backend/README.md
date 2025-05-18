# ControlAI Sales System - Backend

Backend do sistema de PDV (Ponto de Venda) desenvolvido com Node.js, Express e TypeScript.

## Tecnologias Utilizadas

- Node.js (v18+)
- TypeScript
- Express.js
- MongoDB com Mongoose
- JWT para autenticação
- Express Validator para validação
- Helmet para segurança
- Compression para otimização
- Jest para testes
- ESLint e Prettier para qualidade de código
- TypeDoc para documentação

## Estrutura do Projeto

```
src/
├── config/             # Configurações do sistema
├── controllers/        # Controladores da aplicação
├── middleware/         # Middlewares personalizados
├── models/            # Modelos do Mongoose
├── routes/            # Rotas da API
├── types/             # Tipos e interfaces TypeScript
├── utils/             # Utilitários e helpers
├── database/          # Migrações e seeds
└── server.ts          # Arquivo principal do servidor
```

## Funcionalidades Principais

### Autenticação e Autorização
- Login com JWT
- Controle de acesso baseado em funções (RBAC)
- Refresh token
- Proteção contra ataques comuns

### Produtos
- CRUD completo
- Busca com filtros
- Paginação
- Ordenação
- Controle de estoque
- Categorização
- Histórico de preços

### Vendas
- Criação de pedidos
- Processamento de pagamentos
- Histórico de vendas
- Relatórios
- Notas fiscais

### Clientes
- Cadastro de clientes
- Histórico de compras
- Programa de fidelidade
- Crédito/débito de cliente

### Estoque
- Controle de estoque
- Alertas de estoque baixo
- Histórico de movimentações
- Inventário
- Pedidos de compra

### Produção
- Planejamento de produção
- Controle de lotes
- Receitas e fórmulas
- Custos de produção
- Rastreabilidade

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd controlai-sales-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco de dados:
```bash
npm run migrate
```

5. Inicie o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## Documentação da API

### Formato de Resposta

Todas as respostas seguem o seguinte formato:

**Sucesso:**
```json
{
  "success": true,
  "data": {
    // Dados da resposta
  },
  "message": "Mensagem de sucesso (opcional)"
}
```

**Erro:**
```json
{
  "success": false,
  "error": {
    "code": "ERRO_CODE",
    "message": "Mensagem de erro",
    "details": {
      // Detalhes adicionais do erro (opcional)
    }
  }
}
```

### Códigos de Erro Comuns

- `AUTH_001`: Token inválido ou expirado
- `AUTH_002`: Credenciais inválidas
- `AUTH_003`: Acesso não autorizado
- `VAL_001`: Erro de validação de dados
- `DB_001`: Erro de operação no banco de dados
- `API_001`: Erro interno do servidor

### Endpoints

#### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

#### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/products/:id` - Detalhes do produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Remover produto
- `GET /api/products/low-stock` - Produtos com estoque baixo

#### Vendas
- `POST /api/sales` - Criar venda
- `GET /api/sales` - Listar vendas
- `GET /api/sales/:id` - Detalhes da venda
- `PUT /api/sales/:id` - Atualizar venda
- `DELETE /api/sales/:id` - Cancelar venda

#### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Criar cliente
- `GET /api/customers/:id` - Detalhes do cliente
- `PUT /api/customers/:id` - Atualizar cliente
- `DELETE /api/customers/:id` - Remover cliente

#### Produção
- `GET /api/production` - Listar ordens de produção
- `POST /api/production` - Criar ordem de produção
- `GET /api/production/:id` - Detalhes da ordem
- `PUT /api/production/:id` - Atualizar ordem
- `DELETE /api/production/:id` - Cancelar ordem

## Esquema do Banco de Dados

### Produto
```typescript
{
  _id: ObjectId,
  codigo: string,
  nome: string,
  descricao: string,
  preco: number,
  custoUnitario: number,
  estoque: number,
  estoqueMinimo: number,
  categoria: string,
  unidade: string,
  fornecedor: string,
  ativo: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Usuario
```typescript
{
  _id: ObjectId,
  nome: string,
  email: string,
  senha: string,
  cargo: string,
  permissoes: string[],
  ativo: boolean,
  ultimoLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Venda
```typescript
{
  _id: ObjectId,
  codigo: string,
  cliente: ObjectId,
  vendedor: ObjectId,
  itens: [{
    produto: ObjectId,
    quantidade: number,
    precoUnitario: number,
    desconto: number
  }],
  total: number,
  desconto: number,
  formaPagamento: string,
  status: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Cliente
```typescript
{
  _id: ObjectId,
  codigo: string,
  nome: string,
  documento: string,
  email: string,
  telefone: string,
  endereco: {
    rua: string,
    numero: string,
    complemento: string,
    bairro: string,
    cidade: string,
    estado: string,
    cep: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Deploy

### Pré-requisitos

- Node.js 18+
- MongoDB 6+
- PM2 (para produção)

### Produção

1. Configure as variáveis de ambiente:
```bash
cp .env.example .env.production
# Edite as variáveis para produção
```

2. Instale as dependências:
```bash
npm ci
```

3. Build da aplicação:
```bash
npm run build
```

4. Inicie com PM2:
```bash
pm2 start ecosystem.config.js
```

### Docker

1. Build da imagem:
```bash
docker build -t controlai-sales-backend .
```

2. Execute o container:
```bash
docker run -d -p 3000:3000 --env-file .env.production controlai-sales-backend
```

## Monitoramento e Logs

### Logs

Os logs são gerados em diferentes níveis:
- `error`: Erros críticos que precisam de atenção imediata
- `warn`: Avisos importantes mas não críticos
- `info`: Informações gerais do sistema
- `debug`: Informações detalhadas para debugging

Em produção, os logs são salvos em arquivos:
- `/logs/error.log`: Logs de erro
- `/logs/combined.log`: Todos os logs

### Métricas

Métricas disponíveis em `/metrics` (quando habilitado):
- Requisições por segundo
- Tempo de resposta
- Uso de memória
- Conexões de banco de dados
- Status do sistema

### Healthcheck

Endpoint `/health` retorna:
- Status da API
- Conexão com banco de dados
- Uso de memória
- Uptime

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia o servidor em produção
- `npm test` - Executa os testes
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código
- `npm run doc` - Gera a documentação

## Testes

O projeto utiliza Jest para testes. Para executar os testes:

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em watch mode
npm run test:watch
```

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das mudanças (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes. 
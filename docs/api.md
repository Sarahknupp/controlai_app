# Documentação da API

## Visão Geral
A API REST do sistema fornece endpoints para gerenciamento de templates, categorias e versões.

## Autenticação
Todos os endpoints requerem autenticação via JWT token no header:
```
Authorization: Bearer <token>
```

## Endpoints

### Templates

#### Listar Templates
```http
GET /api/templates
```

**Query Parameters:**
- `page` (number, opcional): Número da página (default: 1)
- `limit` (number, opcional): Itens por página (default: 10)
- `search` (string, opcional): Termo de busca
- `category` (string, opcional): ID da categoria
- `active` (boolean, opcional): Filtrar por status
- `sortBy` (string, opcional): Campo para ordenação
- `sortOrder` (string, opcional): Ordem (asc/desc)

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "subject": "string",
      "body": "string",
      "variables": ["string"],
      "categoryId": "string",
      "active": boolean,
      "createdAt": "string",
      "updatedAt": "string",
      "createdBy": "string",
      "currentVersion": number,
      "versions": [
        {
          "id": "string",
          "version": number,
          "changeReason": "string",
          "createdAt": "string"
        }
      ]
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

#### Obter Template
```http
GET /api/templates/:id
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "subject": "string",
  "body": "string",
  "variables": ["string"],
  "categoryId": "string",
  "active": boolean,
  "createdAt": "string",
  "updatedAt": "string",
  "createdBy": "string",
  "currentVersion": number,
  "versions": [
    {
      "id": "string",
      "version": number,
      "changeReason": "string",
      "createdAt": "string"
    }
  ]
}
```

#### Criar Template
```http
POST /api/templates
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "subject": "string",
  "body": "string",
  "variables": ["string"],
  "categoryId": "string",
  "active": boolean
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "subject": "string",
  "body": "string",
  "variables": ["string"],
  "categoryId": "string",
  "active": boolean,
  "createdAt": "string",
  "updatedAt": "string",
  "createdBy": "string",
  "currentVersion": 1
}
```

#### Atualizar Template
```http
PATCH /api/templates/:id
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "subject": "string",
  "body": "string",
  "variables": ["string"],
  "categoryId": "string",
  "active": boolean,
  "changeReason": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "subject": "string",
  "body": "string",
  "variables": ["string"],
  "categoryId": "string",
  "active": boolean,
  "createdAt": "string",
  "updatedAt": "string",
  "createdBy": "string",
  "currentVersion": number
}
```

#### Remover Template
```http
DELETE /api/templates/:id
```

**Response:**
```json
{
  "success": true
}
```

#### Visualizar Prévia
```http
POST /api/templates/:id/preview
```

**Request Body:**
```json
{
  "variables": {
    "variavel1": "valor1",
    "variavel2": "valor2"
  }
}
```

**Response:**
```json
{
  "subject": "string",
  "body": "string"
}
```

### Versões

#### Listar Versões
```http
GET /api/templates/:id/versions
```

**Query Parameters:**
- `sortBy` (string, opcional): Campo para ordenação
- `sortOrder` (string, opcional): Ordem (asc/desc)

**Response:**
```json
[
  {
    "id": "string",
    "version": number,
    "name": "string",
    "description": "string",
    "subject": "string",
    "body": "string",
    "variables": ["string"],
    "categoryId": "string",
    "active": boolean,
    "createdAt": "string",
    "updatedAt": "string",
    "createdBy": "string",
    "changeReason": "string"
  }
]
```

#### Obter Versão
```http
GET /api/templates/:id/versions/:version
```

**Response:**
```json
{
  "id": "string",
  "version": number,
  "name": "string",
  "description": "string",
  "subject": "string",
  "body": "string",
  "variables": ["string"],
  "categoryId": "string",
  "active": boolean,
  "createdAt": "string",
  "updatedAt": "string",
  "createdBy": "string",
  "changeReason": "string"
}
```

#### Restaurar Versão
```http
POST /api/templates/:id/restore/:version
```

**Request Body:**
```json
{
  "changeReason": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "subject": "string",
  "body": "string",
  "variables": ["string"],
  "categoryId": "string",
  "active": boolean,
  "createdAt": "string",
  "updatedAt": "string",
  "createdBy": "string",
  "currentVersion": number
}
```

#### Comparar Versões
```http
GET /api/templates/:id/compare
```

**Query Parameters:**
- `version1` (number, obrigatório): Versão 1
- `version2` (number, obrigatório): Versão 2

**Response:**
```json
{
  "version1": {
    "id": "string",
    "version": number,
    "name": "string",
    "description": "string",
    "subject": "string",
    "body": "string",
    "variables": ["string"],
    "categoryId": "string",
    "active": boolean,
    "createdAt": "string",
    "updatedAt": "string",
    "createdBy": "string",
    "changeReason": "string"
  },
  "version2": {
    "id": "string",
    "version": number,
    "name": "string",
    "description": "string",
    "subject": "string",
    "body": "string",
    "variables": ["string"],
    "categoryId": "string",
    "active": boolean,
    "createdAt": "string",
    "updatedAt": "string",
    "createdBy": "string",
    "changeReason": "string"
  },
  "diff": {
    "name": boolean,
    "description": boolean,
    "subject": boolean,
    "body": boolean,
    "variables": boolean,
    "categoryId": boolean,
    "active": boolean
  }
}
```

### Categorias

#### Listar Categorias
```http
GET /api/template-categories
```

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### Criar Categoria
```http
POST /api/template-categories
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Atualizar Categoria
```http
PATCH /api/template-categories/:id
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Remover Categoria
```http
DELETE /api/template-categories/:id
```

**Response:**
```json
{
  "success": true
}
```

## Códigos de Erro

### 400 Bad Request
- Campos obrigatórios ausentes
- Tipos de dados inválidos
- Valores fora do range permitido

### 401 Unauthorized
- Token ausente
- Token inválido
- Token expirado

### 403 Forbidden
- Permissão insuficiente
- Acesso negado ao recurso

### 404 Not Found
- Recurso não encontrado
- ID inválido

### 409 Conflict
- Nome duplicado
- Versão já existe

### 500 Internal Server Error
- Erro interno do servidor
- Erro de banco de dados

## Rate Limiting
- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário

## Versões da API
- v1 (atual)
- v2 (em desenvolvimento)

## Changelog

### v1.0.0
- Implementação inicial
- CRUD de templates
- Versionamento
- Categorias

### v1.1.0
- Paginação
- Filtros avançados
- Comparação de versões
- Prévia de template

### v1.2.0
- Cache de templates
- Compressão de respostas
- Rate limiting
- Logs detalhados 
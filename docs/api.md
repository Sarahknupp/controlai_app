# Documentação da API

## Visão Geral
A API REST do sistema fornece endpoints para gerenciamento de templates, categorias, versões e envio de e-mails.

## Autenticação
Todos os endpoints requerem autenticação via token JWT no header:
```
Authorization: Bearer <token>
```

### Erros de Autenticação
```json
{
  "erro": "Não Autorizado",
  "mensagem": "Token inválido ou expirado",
  "codigo": "ERRO_AUTH"
}
```

## Endpoints

### Templates

#### Listar Templates
```http
GET /api/templates
```

**Parâmetros de Consulta:**
- `pagina` (número, opcional): Número da página (padrão: 1)
- `limite` (número, opcional): Itens por página (padrão: 10, máximo: 100)
- `busca` (string, opcional): Termo de busca
- `categoria` (string, opcional): ID da categoria
- `ativo` (booleano, opcional): Filtrar por status
- `ordenarPor` (string, opcional): Campo para ordenação
- `ordem` (string, opcional): Ordem (asc/desc)
- `criadoPor` (string, opcional): ID do usuário criador
- `criadoApos` (string, opcional): Data inicial (ISO 8601)
- `criadoAntes` (string, opcional): Data final (ISO 8601)

**Resposta:**
```json
{
  "itens": [
    {
      "id": "string",
      "nome": "string",
      "descricao": "string",
      "assunto": "string",
      "corpo": "string",
      "variaveis": ["string"],
      "idCategoria": "string",
      "ativo": boolean,
      "dataCriacao": "string",
      "dataAtualizacao": "string",
      "criadoPor": "string",
      "versaoAtual": number,
      "versoes": [
        {
          "id": "string",
          "versao": number,
          "motivoAlteracao": "string",
          "dataCriacao": "string"
        }
      ]
    }
  ],
  "total": number,
  "pagina": number,
  "limite": number,
  "temMais": boolean
}
```

**Erros:**
```json
{
  "erro": "Requisição Inválida",
  "mensagem": "Parâmetros inválidos",
  "codigo": "PARAMS_INVALIDOS"
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

## Endpoints de E-mail

### Envio de E-mail
```http
POST /api/email/send
```

**Request Body:**
```json
{
  "template": "string",
  "to": "string",
  "subject": "string",
  "variables": {
    "key": "value"
  },
  "priority": "string",
  "attachments": [
    {
      "filename": "string",
      "content": "string",
      "contentType": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "string",
  "sentAt": "string"
}
```

### Prévia de Template
```http
POST /api/email/preview
```

**Request Body:**
```json
{
  "template": "string",
  "variables": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "subject": "string",
  "html": "string",
  "text": "string"
}
```

### Listar Templates Disponíveis
```http
GET /api/email/templates
```

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "variables": ["string"],
    "example": {
      "variables": {
        "key": "value"
      }
    }
  }
]
```

### Erros de E-mail
```json
{
  "erro": "Erro no Envio",
  "mensagem": "Falha ao enviar e-mail",
  "codigo": "ERRO_EMAIL",
  "detalhes": {
    "template": "string",
    "destinatario": "string",
    "erro": "string"
  }
}
```

## Códigos de Erro

### 400 Bad Request
- Campos obrigatórios ausentes
- Tipos de dados inválidos
- Valores fora do range permitido
- Template não encontrado
- Variáveis inválidas

### 401 Unauthorized
- Token ausente
- Token inválido
- Token expirado

### 403 Forbidden
- Permissão insuficiente
- Acesso negado ao recurso
- Limite de envio excedido

### 404 Not Found
- Recurso não encontrado
- ID inválido
- Template não existe

### 409 Conflict
- Nome duplicado
- Versão já existe
- E-mail duplicado

### 500 Internal Server Error
- Erro interno do servidor
- Erro de banco de dados
- Erro no serviço de e-mail

## Rate Limiting

### Limites
- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário
- 10000 requisições por dia por usuário

### Headers de Resposta
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1612345678
```

### Erro de Rate Limit
```json
{
  "erro": "Muitas Requisições",
  "mensagem": "Limite de requisições excedido",
  "codigo": "LIMITE_EXCEDIDO",
  "tentarApos": 60
}
```

## Paginação

### Parâmetros
- `pagina`: Número da página (começa em 1)
- `limite`: Itens por página (10-100)

### Resposta
```json
{
  "itens": [],
  "total": number,
  "pagina": number,
  "limite": number,
  "temMais": boolean,
  "totalPaginas": number
}
```

## Ordenação

### Parâmetros
- `ordenarPor`: Campo para ordenação
- `ordem`: Ordem (asc/desc)

### Campos Ordenáveis
- `nome`
- `dataCriacao`
- `dataAtualizacao`
- `versaoAtual`

## Filtros

### Operadores
- `eq`: Igual
- `ne`: Diferente
- `gt`: Maior que
- `gte`: Maior ou igual
- `lt`: Menor que
- `lte`: Menor ou igual
- `in`: Contido em
- `nin`: Não contido em
- `like`: Contém texto
- `ilike`: Contém texto (case insensitive)

### Exemplo
```
GET /api/templates?filtro[ativo]=eq:true&filtro[dataCriacao]=gt:2024-01-01
```

## Validação

### Erros de Validação
```json
{
  "erro": "Erro de Validação",
  "mensagem": "Dados inválidos",
  "codigo": "ERRO_VALIDACAO",
  "detalhes": [
    {
      "campo": "nome",
      "mensagem": "Nome é obrigatório",
      "codigo": "OBRIGATORIO"
    }
  ]
}
```

## Versionamento da API

### Versão Atual
- v1 (padrão)

### Especificar Versão
```
GET /api/v1/templates
```

### Deprecação
- Aviso de deprecação no header `Deprecation`
- Data de remoção no header `Sunset`

## Webhooks

### Eventos
- `template.criado`
- `template.atualizado`
- `template.excluido`
- `template.versao.criada`

### Payload
```json
{
  "evento": "template.criado",
  "dataHora": "2024-01-01T00:00:00Z",
  "dados": {
    "id": "string",
    "nome": "string"
  }
}
```

### Configuração
```http
POST /api/webhooks
```

**Corpo da Requisição:**
```json
{
  "url": "string",
  "eventos": ["string"],
  "segredo": "string"
}
```

## Cache

### Headers
```
Cache-Control: public, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

### Condicionais
```
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
```

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
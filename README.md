
# ControlAI Vendas - Sistema ERP Completo

Este repositório contém o sistema ERP "ControlAI Vendas", com frontend em React + Vite e backend em Node.js + Express + TypeScript. A seguir, as instruções para instalação, configuração e deploy.

---

## 📁 Estrutura do Projeto

controlai-vendas/
├── backend/             # API Express (TypeScript)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── frontend/            # App React + Vite (TypeScript)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml   # Orquestração Docker (frontend, backend, mongodb)
└── README.md            # Este arquivo

## 🔧 Pré-requisitos

* [Node.js 18+ e npm](https://nodejs.org/)
* [Docker & Docker Compose](https://docs.docker.com/compose/)
* Conta MongoDB Atlas (para produção) ou MongoDB local

---

## ⚙️ Configuração de Variáveis de Ambiente

Cada serviço possui um arquivo `.env.example` com todas as chaves necessárias. Copie-o para `.env` e ajuste os valores conforme seu ambiente.

### Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

env
PORT=3001
MONGODB_URI=<sua_uri_mongodb>
JWT_SECRET=<seu_jwt_secret>
REDIS_URL=<sua_url_redis>  # ex: redis://localhost:6379
NODE_ENV=development

### Frontend (`frontend/.env`)

```bash
cp frontend/.env.example frontend/.env
```

env
VITE_API_URL=<http://localhost:3001/api>

> **Importante:** nunca commite credenciais reais no repositório. Utilize variáveis de ambiente.

---

## 🚀 Desenvolvimento Local

### Backend

bash
cd backend
dotenv -e .env npm install
npm run dev  # usa ts-node-dev

A API estará em `http://localhost:3001/api` e health-check em `/health`.

### Frontend

bash
cd frontend
dotenv -e .env npm install
npm run dev  # usa Vite

O app ficará disponível em `http://localhost:5173`.

---

## 🐳 Docker Compose

Tudo em um comando (na raiz):

bash
docker-compose up --build

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:3001/api](http://localhost:3001/api)
* Health: [http://localhost:3001/health](http://localhost:3001/health)
* MongoDB: mongodb://mongodb:27017/controlai\_vendas

Para parar e remover containers:

bash
docker-compose down

---

## ✅ CI/CD (GitHub Actions)

Workflow configurado em `.github/workflows/ci.yml`:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. Build & push Docker
5. Deploy via SSH (docker-compose pull && up -d)

> **Segredos** configurados no GitHub (`Settings > Secrets`):
>
> * `MONGODB_URI`, `JWT_SECRET`, `REDIS_URL`, `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `SSH_HOST`, `SSH_USERNAME`, `SSH_KEY`

---

## 📚 Scripts Disponíveis

### Backend (`package.json`)

* `npm run dev`: inicia em modo desenvolvimento
* `npm start`: inicia em produção
* `npm run build`: compila TypeScript
* `npm test`: executa testes via Jest

### Frontend (`package.json`)

* `npm run dev`: inicia Vite
* `npm run build`: gera build de produção
* `npm run preview`: serve build de produção
* `npm run lint`: ESLint
* `npm test`: testes (Jest + Testing Library)

---

## Contribuição

1. Fork deste repositório
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Faça commits claros
4. Crie Pull Request

---
# ControleAI Vendas

Sistema de controle de vendas com recursos avançados de segurança e monitoramento.

## Sobre o Projeto
Sistema completo para gestão empresarial com módulos de vendas, produção, estoque, contabilidade e muito mais. Desenvolvido com React, TypeScript e uma arquitetura moderna para oferecer uma experiência robusta e escalável.

### Principais Funcionalidades
- **PDV (Ponto de Venda)**: Interface intuitiva para vendas
- **Gestão de Estoque**: Controle completo de produtos e inventário
- **Contabilidade**: Gestão fiscal e contábil integrada
- **Produção**: Controle de processos produtivos
- **Relatórios**: Análises e insights detalhados
- **Gestão de Usuários**: Controle de acesso e permissões
- **Certificados Digitais**: Gerenciamento de certificados A1/A3
- **Documentos Fiscais**: Emissão e gestão de NF-e, NFC-e, etc.

## Estrutura do Projeto

app-controlaivendas/
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── services/      # Serviços e APIs
│   │   ├── types/         # Definições de tipos TypeScript
│   │   ├── hooks/         # Custom hooks
│   │   └── routes/        # Configuração de rotas
│   └── public/            # Arquivos estáticos
│
├── backend/               # API Node.js/Express
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── services/     # Serviços
│   │   ├── models/       # Modelos do banco de dados
│   │   ├── routes/       # Rotas da API
│   │   ├── middleware/   # Middlewares
│   │   ├── utils/        # Utilitários
│   │   └── templates/    # Templates de e-mail
│   └── tests/            # Testes
│
└── docs/                 # Documentação


## Tecnologias Principais

- **Frontend**:
  - React 18
  - TypeScript
  - Material-UI
  - Axios
  - React Router

- **Backend**:
  - Node.js
  - Express
  - TypeScript
  - MongoDB
  - JWT Authentication

## Funcionalidades

- Autenticação com 2FA (Two-Factor Authentication)
- Monitoramento de desempenho em tempo real
- Compressão de respostas para otimização
- Rate limiting para proteção contra ataques
- Cache inteligente para melhor performance
- Documentação Swagger/OpenAPI
- Testes automatizados
- Containerização com Docker

## Requisitos

- Node.js 18+
- MongoDB 4.4+
- Redis 6+
- Docker e Docker Compose (opcional)

## Instalação

### Usando Docker (Recomendado)

1. Clone o repositório:
bash
git clone https://github.com/seu-usuario/controleai-vendas.git
cd controleai-vendas


2. Configure as variáveis de ambiente de cada serviço:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
# Edite os arquivos `.env` com suas configurações


3. Inicie os containers:
bash
docker-compose up -d


### Instalação Manual

1. Clone o repositório:
bash
git clone https://github.com/seu-usuario/controleai-vendas.git
cd controleai-vendas


2. Instale as dependências:
bash
npm install


3. Configure as variáveis de ambiente de cada serviço:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
# Edite os arquivos `.env` com suas configurações


4. Inicie o servidor:
bash
npm run dev


## Desenvolvimento

### Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo desenvolvimento
- `npm run build`: Compila o TypeScript
- `npm start`: Inicia o servidor em modo produção
- `npm test`: Executa os testes
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código

### Estrutura do Projeto


backend/
  ├── src/
  │   ├── config/         # Configurações
  │   ├── middleware/     # Middlewares
  │   ├── models/         # Modelos do MongoDB
  │   ├── routes/         # Rotas da API
  │   ├── services/       # Serviços
  │   ├── types/          # Tipos TypeScript
  │   └── utils/          # Utilitários
  ├── tests/              # Testes
  └── Dockerfile          # Configuração do Docker


## Segurança

- Autenticação JWT com refresh tokens
- Proteção contra ataques de força bruta
- Validação de entrada de dados
- Sanitização de dados
- Headers de segurança
- Logs de auditoria

## Monitoramento

- Métricas de performance
- Logs de erros
- Monitoramento de recursos
- Alertas automáticos

## API Documentation

A documentação da API está disponível em `/api-docs` quando o servidor está rodando.

## Contribuição

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

Link do Projeto: [https://github.com/seu-usuario/app-controlaivendas](https://github.com/seu-usuario/app-controlaivendas)# controlai_app


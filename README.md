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

Na raiz de cada serviço (backend e frontend), crie um arquivo `.env` com as chaves abaixo.

### Backend (`backend/.env`)

env
PORT=3001
MONGODB_URI=<sua_uri_mongodb>
JWT_SECRET=<seu_jwt_secret>
REDIS_URL=<sua_url_redis>  # ex: redis://localhost:6379
NODE_ENV=development

### Frontend (`frontend/.env`)

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

## 📝 Licença

Este projeto está licenciado sob MIT. Veja \[LICENSE.md].

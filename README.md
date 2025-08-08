# ControlAI Vendas ERP

ControlAI Vendas is a full stack ERP system with a React + Vite frontend and a Node.js + Express backend written in TypeScript.

## Quick Start


bash
git clone <repo>
cd controlai_app
npm install
npm run dev


Or run everything with Docker Compose:

bash
docker-compose up --build

Once running, administrators can access a simplified dashboard at `/dashboard` for easy navigation.


## Installation

1. Install **Node.js 18+** and **Docker Compose**.
2. Copy environment configuration files:
## 📁 Estrutura do Projeto

controlai_app/
├── backend/    # API Express
├── frontend/   # Aplicação React + Vite
└── docs/       # Documentação


## 🔧 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose (opcional)
- Instância do MongoDB (local ou Atlas)

## ⚙️ Configuração de Ambiente

Cada serviço possui um `.env.example`. Copie para `.env` e ajuste conforme o seu ambiente:


bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env


3. Edit the `.env` files with your settings.
4. Start the development servers:
bash
cd backend && npm run dev
cd ../frontend && npm run dev


## Contributing

1. Fork this repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes and push the branch.
4. Open a Pull Request.

## Documentation

Additional documentation is available in the [`docs/`](docs) folder. A Portuguese version of this README can be found in [README_pt.md](README_pt.md).

## License

This project is licensed under the ISC license. See [LICENSE](LICENSE) for details.

**Importante:** nunca versionar credenciais reais.

## 🧪 Executar Testes Localmente

Instale as dependências com o comando recomendado e rode a suíte de testes:

bash
npm ci --legacy-peer-deps
npm test


Se necessário, crie um arquivo `.env.test` contendo variáveis como `SMTP_HOST`,
`SMTP_USER`, `TWILIO_ACCOUNT_SID`, `FIREBASE_PROJECT_ID`, `REDIS_HOST` etc.,
utilizadas nos testes do backend. Valores padrão são definidos em
`backend/src/tests/setup.ts`.

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


### Backend
bash
cd backend
npm install
npm run dev


A API estará em `http://localhost:3001/api`.

### Frontend

bash
cd frontend
npm install
npm run dev


Abra `http://localhost:5173` no navegador.

## 🐳 Docker Compose

Execute na raiz do projeto:

bash
docker-compose up --build


- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3001/api>
- Health: <http://localhost:3001/health>

Para parar:

bash
docker-compose down


## 🧪 Executar Testes Localmente

Instale as dependências e rode os testes:

bash
npm ci --legacy-peer-deps
npm test


Se necessário, crie `.env.test` com variáveis como `SMTP_HOST`, `SMTP_USER`, `TWILIO_ACCOUNT_SID`, `FIREBASE_PROJECT_ID`, `REDIS_HOST` etc. Valores padrão encontram-se em `backend/src/tests/setup.ts`. Alguns testes também utilizam as chaves exemplificadas em `backend/.env.example` e `frontend/.env.example`.

## 📚 Scripts Úteis

- `npm run dev` – inicia modo desenvolvimento
- `npm run build` – gera build de produção
- `npm start` – executa o servidor compilado
- `npm test` – executa a suíte de testes
- `npm run lint` – roda o ESLint
- `npm run type-check` – verifica os tipos TypeScript sem gerar arquivos

## ✅ CI/CD

O workflow do GitHub Actions realiza lint, testes e build das imagens Docker, além do deploy via SSH.

## Sobre o Projeto

Plataforma de gestão empresarial com módulos de vendas, estoque, produção e contabilidade. Inclui recursos de segurança, monitoramento e emissão de documentos fiscais.

### Principais Funcionalidades

- **PDV (Ponto de Venda)**
- **Gestão de Estoque**
- **Contabilidade Integrada**
- **Produção**
- **Relatórios e Insights**
- **Gestão de Usuários**
- **Certificados Digitais**
- **Documentos Fiscais (NF-e, NFC-e, etc.)**

## Contribuição

1. Faça um fork deste repositório.
2. Crie uma branch: `git checkout -b feature/minha-feature`.
3. Commit suas alterações.
4. Abra um Pull Request.

## Licença

Distribuído sob a licença ISC. Consulte o arquivo [LICENSE](LICENSE) para detalhes.


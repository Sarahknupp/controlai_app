# ControlAI Vendas

Sistema ERP completo composto por backend Node.js/Express com TypeScript e frontend React com Vite.

## 🚀 Quick Start

```bash
git clone <repo>
cd controlai_app
npm install
npm run dev
```

Ou utilize Docker Compose:

```bash
docker-compose up --build
```

## 📁 Estrutura do Projeto

```
controlai_app/
├── backend/    # API Express
├── frontend/   # Aplicação React + Vite
└── docs/       # Documentação
```

## 🔧 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose (opcional)
- Instância do MongoDB (local ou Atlas)

## ⚙️ Configuração de Ambiente

Cada serviço possui um `.env.example`. Copie para `.env` e ajuste conforme o seu ambiente:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

> **Importante:** nunca versionar credenciais reais.

## Desenvolvimento Local

### Backend

```bash
cd backend
npm install
npm run dev
```

A API estará em `http://localhost:3001/api`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

## 🐳 Docker Compose

Execute na raiz do projeto:

```bash
docker-compose up --build
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3001/api>
- Health: <http://localhost:3001/health>

Para parar:

```bash
docker-compose down
```

## 🧪 Executar Testes Localmente

Instale as dependências e rode os testes:

```bash
npm ci --legacy-peer-deps
npm test
```

Se necessário, crie `.env.test` com variáveis como `SMTP_HOST`, `SMTP_USER`, `TWILIO_ACCOUNT_SID`, `FIREBASE_PROJECT_ID`, `REDIS_HOST` etc. Valores padrão encontram-se em `backend/src/tests/setup.ts`. Alguns testes também utilizam as chaves exemplificadas em `backend/.env.example` e `frontend/.env.example`.

## 📚 Scripts Úteis

- `npm run dev` – inicia modo desenvolvimento
- `npm run build` – gera build de produção
- `npm start` – executa o servidor compilado
- `npm test` – executa a suíte de testes
- `npm run lint` – roda o ESLint

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

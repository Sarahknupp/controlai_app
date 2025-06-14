# ControlAI Vendas ERP

[![CI Status](https://github.com/your-username/controlai-vendas/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/controlai-vendas/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

**ControlAI Vendas** é um sistema ERP completo para gestão empresarial, com módulos de vendas, estoque, finanças e muito mais.

---

## Tecnologias

* **Frontend:** React 18 · TypeScript · Vite · TailwindCSS
* **Backend:** Node.js 18 · Express · TypeScript · MongoDB · Mongoose
* **DevOps:** Docker · Docker Compose · GitHub Actions

---

## Funcionalidades Principais

* PDV (Ponto de Venda)
* Gestão de Estoque
* Emissão de Documentos Fiscais (NF-e, NFC-e)
* Relatórios e Métricas
* Autenticação JWT
* Módulo de Backup e Sincronização

---

## 🚀 Quick Start

### 1. Clone o repositório

bash
git clone https://github.com/your-username/controlai-vendas.git
cd controlai-vendas

---

### 2. Configurar variáveis de ambiente

Crie um `.env` na raiz com:

```
# Backend
PORT=3001
MONGODB_URI=<sua-URI-MongoDB>
JWT_SECRET=<seu-Secret>

# Frontend (no diretório frontend)
VITE_API_URL=http://localhost:3001/api
```

### 3. Instalar dependências e rodar localmente

bash
# Backend
cd backend
npm install
npm run dev

# Frontend (em outra aba)
cd ../frontend
npm install
npm run dev

---

Acesse:

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:3001/api](http://localhost:3001/api)
* Health check: [http://localhost:3001/health](http://localhost:3001/health)

---

## 🐳 Docker Compose

bash
docker-compose up --build -d

Serviços:

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:3001/api](http://localhost:3001/api)
* MongoDB: mongodb://localhost:27017/controlai\_vendas

Para parar:

bash
docker-compose down

---

## 🤝 Contribuição

1. Faça um fork
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit e push (`git commit -m "Add feature" && git push origin feature/nova-funcionalidade`)
4. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Consulte o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.

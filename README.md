# Sistema de Gestão Empresarial (PDV)

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

## Tecnologias Utilizadas
- **Frontend**:
  - React 18+
  - TypeScript
  - TailwindCSS
  - React Query
  - React Router DOM
  - Axios
  - Vite

- **Backend**:
  - Node.js 18+
  - Express
  - MongoDB
  - Mongoose
  - JWT Authentication
  - TypeScript

## Pré-requisitos
- Node.js 18+
- NPM ou Yarn
- MongoDB
- Git

## Instalação

### Backend
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/app_controlaivendas.git
   cd app_controlaivendas
   ```

2. Crie um novo diretório para o backend:
   ```bash
   mkdir backend
   cd backend
   ```

3. Inicialize um novo projeto Node.js:
   ```bash
   npm init -y
   ```

4. Instale as dependências necessárias:
   ```bash
   npm install express mongoose dotenv cors bcryptjs jsonwebtoken
   ```

5. Crie a estrutura de diretórios:
   ```bash
   mkdir src
   mkdir src/controllers
   mkdir src/models
   mkdir src/routes
   mkdir src/middleware
   mkdir src/config
   ```

6. Configure o arquivo .env:
   ```
   PORT=5000
   MONGODB_URI=sua_uri_do_mongodb
   JWT_SECRET=seu_jwt_secret
   ```

7. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Frontend
1. Na pasta raiz do projeto, crie um novo diretório para o frontend:
   ```bash
   mkdir frontend
   cd frontend
   ```

2. Instale as dependências do projeto:
   ```bash
   npm install react react-dom react-router-dom @tanstack/react-query axios
   npm install -D typescript @types/react @types/react-dom
   ```

3. Configure o arquivo .env na raiz do frontend:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Configure a integração com o backend no arquivo src/api/config.ts:
   ```typescript
   import axios from 'axios';

   export const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL,
     headers: {
       'Content-Type': 'application/json'
     }
   });
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

O frontend estará disponível em http://localhost:5173 e se comunicará com o backend na porta 5000.

## Como Executar com Docker Compose

Para executar o projeto usando Docker Compose, siga estes passos:

1. Certifique-se de ter o Docker e Docker Compose instalados:
   ```bash
   docker --version
   docker-compose --version
   ```

2. Na raiz do projeto, execute:
   ```bash
   docker-compose up --build
   ```

3. Os serviços estarão disponíveis em:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/health
   - MongoDB: mongodb://localhost:27017

4. Para parar os containers:
   ```bash
   docker-compose down
   ```

5. Para ver os logs:
   ```bash
   # Logs de todos os serviços
   docker-compose logs -f
   
   # Logs de um serviço específico
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f mongodb
   ```

### Variáveis de Ambiente no Docker

O Docker Compose configura automaticamente:
- MongoDB:
  - Porta: 27017
  - Banco de dados: controlai_vendas
  - Dados persistentes em volume

- Backend:
  - Porta: 3001
  - NODE_ENV: production
  - MONGO_URI: mongodb://mongodb:27017/controlai_vendas

- Frontend:
  - Porta: 5173
  - VITE_BACKEND_URL: http://localhost:3001/api

Para sobrescrever estas variáveis, você pode:
1. Criar um arquivo `.env` na raiz do projeto
2. Ou passar as variáveis diretamente no comando:
   ```bash
   NODE_ENV=development docker-compose up
   ```

## Estrutura do Projeto

### Frontend
```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── context/       # Contextos React
├── hooks/         # Hooks personalizados
├── services/      # Serviços e integrações
├── types/         # Definições de tipos TypeScript
├── utils/         # Funções utilitárias
└── lib/           # Bibliotecas e configurações
```

### Backend
```
src/
├── controllers/   # Controladores da API
├── models/        # Modelos do MongoDB
├── routes/        # Rotas da API
├── middleware/    # Middlewares
├── config/        # Configurações
└── utils/         # Funções utilitárias
```

## Scripts Disponíveis

### Frontend
- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera build de produção
- `npm run preview`: Visualiza build de produção
- `npm run lint`: Executa verificação de lint
- `npm run test`: Executa testes

### Backend
- `npm run dev`: Inicia o servidor em modo desenvolvimento
- `npm run start`: Inicia o servidor em produção
- `npm run build`: Compila TypeScript
- `npm run test`: Executa testes

## Deploy no Replit

### Passos para rodar no Replit

1. **Importe o projeto para o Replit**  
   - Clique em "Create Repl" e selecione "Import from GitHub".
   - Cole a URL do repositório:  
     `https://github.com/seu-usuario/app_controlaivendas.git`

2. **Configuração das variáveis de ambiente**  
   - No painel esquerdo, clique em "Secrets" (ícone de cadeado).
   - Adicione as variáveis necessárias, por exemplo:
     - `PORT=5000`
     - `MONGODB_URI=sua_uri_do_mongodb`
     - `JWT_SECRET=seu_jwt_secret`
     - `VITE_API_URL=http://localhost:5000/api` (para o frontend)

3. **Instale as dependências**  
   - No shell do Replit, execute:
     ```bash
     cd backend
     npm install
     cd ../frontend
     npm install
     ```

4. **Build do Frontend**  
   - Ainda na pasta `frontend`, execute:
     ```bash
     npm run build
     ```
   - Isso irá gerar a pasta `dist` com os arquivos de produção.

5. **Rodando o Backend**  
   - Volte para a pasta `backend`:
     ```bash
     cd ../backend
     npm run start
     ```
   - Certifique-se de que o backend está configurado para servir os arquivos estáticos do frontend (pasta `dist`).

6. **Acesse a aplicação**  
   - O Replit irá fornecer uma URL pública para acessar sua aplicação.

### Dicas Importantes para Deploy no Replit

- **Porta:**  
  Use a variável de ambiente `PORT` fornecida pelo Replit (geralmente já está disponível como `process.env.PORT`).
- **Banco de Dados:**  
  Use um MongoDB Atlas ou outro serviço externo, pois o Replit não suporta MongoDB local.
- **Servir o Frontend pelo Backend:**  
  Configure o backend para servir os arquivos estáticos do frontend (pasta `dist`).  
  Exemplo em Express:
  ```js
  const express = require('express');
  const path = require('path');
  const app = express();

  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
  ```
- **Scripts no Replit:**  
  Você pode criar um script no arquivo `.replit` para rodar ambos (build e start) automaticamente.

## Contribuindo
1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Faça Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## Contato
Seu Nome - [@seutwitter](https://twitter.com/seutwitter) - email@example.com

Link do Projeto: [https://github.com/seu-usuario/app_controlaivendas](https://github.com/seu-usuario/app_controlaivendas)# controlai_app

## Deploy

### Pré-requisitos

1. Instale o Vercel CLI:
```bash
npm install -g vercel
```

2. Faça login no Vercel:
```bash
vercel login
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
MONGODB_URI=sua_uri_mongodb
REDIS_URL=sua_url_redis

# Autenticação
JWT_SECRET=seu_secret_jwt
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=seu_host_smtp
SMTP_PORT=587
SMTP_USER=seu_usuario_smtp
SMTP_PASS=sua_senha_smtp

# Outros
NODE_ENV=production
PORT=3000
```

### Comandos de Deploy

1. Deploy em Produção:
```bash
npm run deploy
```

2. Deploy em Staging:
```bash
npm run deploy:staging
```

3. Deploy Preview:
```bash
npm run deploy:preview
```

### Estrutura do Deploy

- Frontend: `/build`
- Backend: `/backend/src/server.ts`
- API Routes: `/api/*`

### Monitoramento

Após o deploy, você pode monitorar sua aplicação no dashboard do Vercel:
- Logs
- Métricas de Performance
- Erros
- Deployments

### Troubleshooting

1. Se o build falhar:
   - Verifique se todas as dependências estão instaladas
   - Verifique se todas as variáveis de ambiente estão configuradas
   - Verifique os logs de build no dashboard do Vercel

2. Se a aplicação não iniciar:
   - Verifique os logs de runtime no dashboard do Vercel
   - Verifique se as variáveis de ambiente estão corretas
   - Verifique se as portas estão configuradas corretamente

3. Se houver problemas com o banco de dados:
   - Verifique se a URI do MongoDB está correta
   - Verifique se o banco está acessível
   - Verifique se as credenciais estão corretas

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

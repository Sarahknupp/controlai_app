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

```
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
```

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
```bash
git clone https://github.com/seu-usuario/controleai-vendas.git
cd controleai-vendas
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Inicie os containers:
```bash
docker-compose up -d
```

### Instalação Manual

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/controleai-vendas.git
cd controleai-vendas
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

4. Inicie o servidor:
```bash
npm run dev
```

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo desenvolvimento
- `npm run build`: Compila o TypeScript
- `npm start`: Inicia o servidor em modo produção
- `npm test`: Executa os testes
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código

### Estrutura do Projeto

```
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
```

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

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato
Seu Nome - [@seutwitter](https://twitter.com/seutwitter) - email@example.com

Link do Projeto: [https://github.com/seu-usuario/app-controlaivendas](https://github.com/seu-usuario/app-controlaivendas)# controlai_app

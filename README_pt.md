# ControlAI Vendas - Sistema ERP

Este repositório contém o sistema ERP com frontend em React + Vite e backend em Node.js + Express.

## Início Rápido

```bash
git clone <repo>
cd controlai_app
npm install
npm run dev
```

Ou utilize o Docker Compose:

```bash
docker-compose up --build
```

## Instalação

1. Tenha **Node.js 18+** e **Docker Compose** instalados.
2. Copie os arquivos de variáveis de ambiente:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Edite os arquivos `.env` conforme o seu ambiente.
4. Inicie os servidores de desenvolvimento:

```bash
cd backend && npm run dev
cd ../frontend && npm run dev
```

## Contribuição

1. Fork deste repositório.
2. Crie uma branch: `git checkout -b feature/minha-feature`.
3. Faça commits e envie sua branch.
4. Abra um Pull Request.

## Documentação

Mais detalhes estão no diretório [`docs/`](docs).

## Licença

Projeto licenciado sob a licença ISC. Consulte [LICENSE](LICENSE).

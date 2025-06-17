# ControlAI Vendas ERP

ControlAI Vendas is a full stack ERP system with a React + Vite frontend and a Node.js + Express backend written in TypeScript.

## Quick Start

```bash
git clone <repo>
cd controlai_app
npm install
npm run dev
```

Or run everything with Docker Compose:

```bash
docker-compose up --build
```

## Installation

1. Install **Node.js 18+** and **Docker Compose**.
2. Copy environment configuration files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Edit the `.env` files with your settings.
4. Start the development servers:

```bash
cd backend && npm run dev
cd ../frontend && npm run dev
```

## Contributing

1. Fork this repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes and push the branch.
4. Open a Pull Request.

## Documentation

Additional documentation is available in the [`docs/`](docs) folder. A Portuguese version of this README can be found in [README_pt.md](README_pt.md).

## License

This project is licensed under the ISC license. See [LICENSE](LICENSE) for details.

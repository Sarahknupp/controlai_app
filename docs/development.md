# Guia de Desenvolvimento

## Visão Geral
Este documento descreve os padrões e práticas de desenvolvimento do sistema.

## Tecnologias

### Frontend
- React 18
- TypeScript 4.9
- Material-UI 5
- React Query
- React Router 6
- Jest + React Testing Library
- ESLint + Prettier

### Backend
- Node.js 18
- Express 4
- MongoDB 6
- Mongoose 7
- JWT Authentication
- Jest + Supertest
- ESLint + Prettier

## Estrutura do Projeto

### Frontend
```
frontend/
├── src/
│   ├── components/     # Componentes React
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços de API
│   ├── store/         # Gerenciamento de estado
│   ├── styles/        # Estilos globais
│   ├── types/         # Definições de tipos
│   └── utils/         # Funções utilitárias
├── public/            # Arquivos estáticos
└── tests/             # Testes
```

### Backend
```
backend/
├── src/
│   ├── config/        # Configurações
│   ├── controllers/   # Controladores
│   ├── middleware/    # Middlewares
│   ├── models/        # Modelos MongoDB
│   ├── routes/        # Rotas
│   ├── services/      # Lógica de negócio
│   └── utils/         # Funções utilitárias
└── tests/             # Testes
```

## Padrões de Código

### Nomenclatura
- **Arquivos**: kebab-case (ex: `template-service.ts`)
- **Classes**: PascalCase (ex: `TemplateService`)
- **Interfaces**: PascalCase com prefixo I (ex: `ITemplate`)
- **Funções**: camelCase (ex: `getTemplateById`)
- **Variáveis**: camelCase (ex: `templateList`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_TEMPLATE_SIZE`)

### Componentes React
```typescript
// Nome do arquivo: TemplateList.tsx
import React from 'react';
import { useQuery } from 'react-query';
import { templateService } from '../services/template.service';
import { ITemplate } from '../types/template.types';

interface TemplateListProps {
  categoryId?: string;
  onSelect?: (template: ITemplate) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  categoryId,
  onSelect
}) => {
  const { data, isLoading, error } = useQuery(
    ['templates', categoryId],
    () => templateService.getTemplates({ categoryId })
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data?.items.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => onSelect?.(template)}
        />
      ))}
    </div>
  );
};
```

### Serviços
```typescript
// Nome do arquivo: template.service.ts
import { api } from '../config/api';
import { ITemplate, ITemplateCreate } from '../types/template.types';

export class TemplateService {
  async getTemplates(params: TemplateSearchParams): Promise<PaginatedResponse<ITemplate>> {
    const response = await api.get('/templates', { params });
    return response.data;
  }

  async getTemplateById(id: string): Promise<ITemplate> {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  }

  async createTemplate(data: ITemplateCreate): Promise<ITemplate> {
    const response = await api.post('/templates', data);
    return response.data;
  }

  async updateTemplate(id: string, data: Partial<ITemplate>): Promise<ITemplate> {
    const response = await api.patch(`/templates/${id}`, data);
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  }
}

export const templateService = new TemplateService();
```

### Controladores
```typescript
// Nome do arquivo: template.controller.ts
import { Request, Response } from 'express';
import { TemplateService } from '../services/template.service';
import { validateTemplate } from '../validators/template.validator';

export class TemplateController {
  constructor(private templateService: TemplateService) {}

  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await this.templateService.getTemplates(req.query);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTemplateById(req: Request, res: Response): Promise<void> {
    try {
      const template = await this.templateService.getTemplateById(req.params.id);
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateTemplate(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const template = await this.templateService.createTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

## Testes

### Testes Unitários
```typescript
// Nome do arquivo: template.service.test.ts
import { TemplateService } from './template.service';
import { api } from '../config/api';

jest.mock('../config/api');

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(() => {
    service = new TemplateService();
    jest.clearAllMocks();
  });

  describe('getTemplates', () => {
    it('should return templates', async () => {
      const mockTemplates = {
        items: [
          {
            id: '1',
            name: 'Template 1'
          }
        ],
        total: 1,
        page: 1,
        limit: 10
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockTemplates });

      const result = await service.getTemplates({});

      expect(api.get).toHaveBeenCalledWith('/templates', { params: {} });
      expect(result).toEqual(mockTemplates);
    });
  });
});
```

### Testes de Integração
```typescript
// Nome do arquivo: template.integration.test.ts
import request from 'supertest';
import { app } from '../app';
import { connectDB, closeDB } from '../config/database';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

describe('Template API', () => {
  describe('GET /api/templates', () => {
    it('should return templates', async () => {
      const response = await request(app)
        .get('/api/templates')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
    });
  });
});
```

### Testes de Componentes
```typescript
// Nome do arquivo: TemplateList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { TemplateList } from './TemplateList';
import { templateService } from '../services/template.service';

jest.mock('../services/template.service');

describe('TemplateList', () => {
  it('should render templates', async () => {
    const mockTemplates = {
      items: [
        {
          id: '1',
          name: 'Template 1'
        }
      ],
      total: 1,
      page: 1,
      limit: 10
    };

    (templateService.getTemplates as jest.Mock).mockResolvedValue(mockTemplates);

    render(<TemplateList />);

    await waitFor(() => {
      expect(screen.getByText('Template 1')).toBeInTheDocument();
    });
  });
});
```

## Deploy

### Frontend
1. Build da aplicação:
```bash
npm run build
```

2. Testes:
```bash
npm run test
npm run test:coverage
```

3. Deploy:
```bash
npm run deploy
```

### Backend
1. Build:
```bash
npm run build
```

2. Testes:
```bash
npm run test
npm run test:coverage
```

3. Deploy:
```bash
npm run deploy
```

## Monitoramento

### Logs
- Frontend: `logs/frontend.log`
- Backend: `logs/backend.log`

### Métricas
- Tempo de resposta
- Taxa de erros
- Uso de recursos
- Queries lentas

### Alertas
- Erros 5xx
- Tempo de resposta > 1s
- Uso de CPU > 80%
- Uso de memória > 80%

## Segurança

### Autenticação
- JWT com expiração
- Refresh token
- Rate limiting
- CORS configurado

### Validação
- Sanitização de entrada
- Validação de tipos
- Proteção contra XSS
- Proteção contra CSRF

### Dados
- Criptografia em trânsito (HTTPS)
- Criptografia em repouso
- Backup automático
- Logs de auditoria

## Performance

### Frontend
- Code splitting
- Lazy loading
- Cache de assets
- Compressão de imagens
- Minificação de código

### Backend
- Cache de consultas
- Compressão de respostas
- Pool de conexões
- Indexação de banco
- Rate limiting

## Contribuição

### Processo
1. Fork do repositório
2. Branch feature/fix
3. Commit com mensagem clara
4. Push para o branch
5. Pull request

### Commits
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração de código
test: adiciona testes
chore: atualiza dependências
```

### Code Review
- Testes passando
- Cobertura mínima 80%
- Sem erros de lint
- Documentação atualizada
- Performance aceitável 
# Guia de Desenvolvimento

## Visão Geral
Este documento descreve os padrões e práticas de desenvolvimento do sistema.

## Tecnologias

### Frontend
- React 18
- TypeScript 5.0
- Material-UI 5
- React Query 4
- React Router 6
- Jest + React Testing Library
- ESLint + Prettier
- Tailwind CSS 3

### Backend
- Node.js 18
- Express 4
- MongoDB 6
- Mongoose 7
- Autenticação JWT
- Jest + Supertest
- ESLint + Prettier
- TypeScript 5.0

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
- **Arquivos**: kebab-case (ex: `servico-template.ts`)
- **Classes**: PascalCase (ex: `ServicoTemplate`)
- **Interfaces**: PascalCase com prefixo I (ex: `ITemplate`)
- **Funções**: camelCase (ex: `obterTemplatePorId`)
- **Variáveis**: camelCase (ex: `listaTemplates`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `TAMANHO_MAXIMO_TEMPLATE`)
- **Tipos**: PascalCase (ex: `RespostaTemplate`)
- **Enums**: PascalCase (ex: `StatusTemplate`)

### Componentes React
```typescript
// Nome do arquivo: ListaTemplates.tsx
import React from 'react';
import { useQuery } from 'react-query';
import { servicoTemplate } from '../servicos/servico-template';
import { ITemplate } from '../tipos/template.types';

interface PropsListaTemplates {
  idCategoria?: string;
  aoSelecionar?: (template: ITemplate) => void;
}

export const ListaTemplates: React.FC<PropsListaTemplates> = ({
  idCategoria,
  aoSelecionar
}) => {
  const { dados, carregando, erro } = useQuery(
    ['templates', idCategoria],
    () => servicoTemplate.obterTemplates({ idCategoria })
  );

  if (carregando) return <Carregando />;
  if (erro) return <MensagemErro erro={erro} />;

  return (
    <div>
      {dados?.itens.map(template => (
        <CartaoTemplate
          key={template.id}
          template={template}
          aoClicar={() => aoSelecionar?.(template)}
        />
      ))}
    </div>
  );
};
```

### Serviços
```typescript
// Nome do arquivo: servico-template.ts
import { api } from '../config/api';
import { ITemplate, ICriacaoTemplate } from '../tipos/template.types';

export class ServicoTemplate {
  async obterTemplates(params: ParametrosBuscaTemplate): Promise<RespostaPaginada<ITemplate>> {
    const resposta = await api.get('/templates', { params });
    return resposta.data;
  }

  async obterTemplatePorId(id: string): Promise<ITemplate> {
    const resposta = await api.get(`/templates/${id}`);
    return resposta.data;
  }

  async criarTemplate(dados: ICriacaoTemplate): Promise<ITemplate> {
    const resposta = await api.post('/templates', dados);
    return resposta.data;
  }

  async atualizarTemplate(id: string, dados: Partial<ITemplate>): Promise<ITemplate> {
    const resposta = await api.patch(`/templates/${id}`, dados);
    return resposta.data;
  }

  async excluirTemplate(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  }
}

export const servicoTemplate = new ServicoTemplate();
```

### Controladores
```typescript
// Nome do arquivo: controlador-template.ts
import { Request, Response } from 'express';
import { ServicoTemplate } from '../servicos/servico-template';
import { validarTemplate } from '../validadores/validador-template';

export class ControladorTemplate {
  constructor(private servicoTemplate: ServicoTemplate) {}

  async obterTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await this.servicoTemplate.obterTemplates(req.query);
      res.json(templates);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async obterTemplatePorId(req: Request, res: Response): Promise<void> {
    try {
      const template = await this.servicoTemplate.obterTemplatePorId(req.params.id);
      if (!template) {
        res.status(404).json({ erro: 'Template não encontrado' });
        return;
      }
      res.json(template);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async criarTemplate(req: Request, res: Response): Promise<void> {
    try {
      const validacao = validarTemplate(req.body);
      if (!validacao.sucesso) {
        res.status(400).json({ erro: validacao.erro });
        return;
      }

      const template = await this.servicoTemplate.criarTemplate(req.body);
      res.status(201).json(template);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}
```

## Testes

### Testes Unitários
```typescript
// Nome do arquivo: servico-template.test.ts
import { ServicoTemplate } from './servico-template';
import { api } from '../config/api';

jest.mock('../config/api');

describe('ServicoTemplate', () => {
  let servico: ServicoTemplate;

  beforeEach(() => {
    servico = new ServicoTemplate();
    jest.clearAllMocks();
  });

  describe('obterTemplates', () => {
    it('deve retornar templates', async () => {
      const templatesMock = {
        itens: [
          {
            id: '1',
            nome: 'Template 1',
            descricao: 'Descrição 1',
            assunto: 'Assunto 1',
            corpo: 'Corpo 1',
            variaveis: ['var1'],
            idCategoria: 'cat1',
            ativo: true,
            dataCriacao: '2024-01-01T00:00:00Z',
            dataAtualizacao: '2024-01-01T00:00:00Z',
            criadoPor: 'user1',
            versaoAtual: 1
          }
        ],
        total: 1,
        pagina: 1,
        limite: 10
      };

      (api.get as jest.Mock).mockResolvedValue({ data: templatesMock });

      const resultado = await servico.obterTemplates({});

      expect(api.get).toHaveBeenCalledWith('/templates', { params: {} });
      expect(resultado).toEqual(templatesMock);
    });

    it('deve tratar erros', async () => {
      const erro = new Error('Erro de rede');
      (api.get as jest.Mock).mockRejectedValue(erro);

      await expect(servico.obterTemplates({})).rejects.toThrow('Erro de rede');
    });
  });
});
```

### Testes de Integração
```typescript
// Nome do arquivo: template.integracao.test.ts
import request from 'supertest';
import { app } from '../app';
import { conectarBD, fecharBD } from '../config/banco-dados';
import { criarUsuarioTeste, gerarToken } from '../utils/teste-utils';

let tokenAutenticacao: string;

beforeAll(async () => {
  await conectarBD();
  const usuarioTeste = await criarUsuarioTeste();
  tokenAutenticacao = gerarToken(usuarioTeste);
});

afterAll(async () => {
  await fecharBD();
});

describe('API de Templates', () => {
  describe('GET /api/templates', () => {
    it('deve retornar templates quando autenticado', async () => {
      const resposta = await request(app)
        .get('/api/templates')
        .set('Authorization', `Bearer ${tokenAutenticacao}`);

      expect(resposta.status).toBe(200);
      expect(resposta.body).toHaveProperty('itens');
      expect(resposta.body).toHaveProperty('total');
    });

    it('deve retornar 401 quando não autenticado', async () => {
      const resposta = await request(app)
        .get('/api/templates');

      expect(resposta.status).toBe(401);
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

## CI/CD

### Pipeline de Desenvolvimento
1. Verificação de lint
2. Compilação TypeScript
3. Testes unitários
4. Testes de integração
5. Build
6. Deploy para staging

### Ambiente de Produção
- Deploy automático após aprovação
- Rollback automático em caso de falha
- Monitoramento de performance
- Logs centralizados
- Alertas configurados

## Segurança

### Boas Práticas
1. Validação de entrada
2. Sanitização de dados
3. Proteção contra XSS
4. Rate limiting
5. CORS configurado
6. Headers de segurança
7. Autenticação JWT
8. Autorização baseada em roles

### Auditoria
- Logs de acesso
- Logs de erro
- Logs de auditoria
- Monitoramento de segurança
- Análise de vulnerabilidades 

## Desenvolvimento de Templates de E-mail

### Estrutura de Diretórios
```
backend/
├── src/
│   ├── templates/
│   │   └── email/          # Templates de e-mail
│   │       ├── default_notification.html
│   │       ├── alert_notification.html
│   │       ├── password_reset.html
│   │       ├── welcome.html
│   │       ├── error_notification.html
│   │       ├── report_notification.html
│   │       ├── system_notification.html
│   │       └── user_notification.html
│   └── services/
│       └── email/          # Serviços de e-mail
```

### Padrões de Template
1. **Estrutura HTML**
   - DOCTYPE e meta tags
   - Atributo lang="pt-BR"
   - Estrutura semântica
   - Atributos ARIA

2. **Estilos CSS**
   - Estilos inline para compatibilidade
   - Media queries para responsividade
   - Cores consistentes
   - Tipografia legível

3. **Variáveis**
   - Sintaxe Handlebars
   - Validação de variáveis
   - Valores padrão
   - Documentação clara

4. **Acessibilidade**
   - Roles ARIA apropriados
   - Contraste adequado
   - Textos alternativos
   - Estrutura semântica

### Boas Práticas

1. **Design**
   - Layout responsivo
   - Compatibilidade com clientes
   - Imagens otimizadas
   - Cores consistentes

2. **Código**
   - HTML válido
   - CSS otimizado
   - Variáveis documentadas
   - Comentários explicativos

3. **Testes**
   - Renderização em diferentes clientes
   - Validação de variáveis
   - Testes de acessibilidade
   - Testes de responsividade

4. **Performance**
   - Imagens otimizadas
   - CSS minificado
   - Código limpo
   - Carregamento rápido

### Ferramentas de Desenvolvimento

1. **Editores**
   - VS Code com extensões
   - Prettier para formatação
   - ESLint para linting
   - Emmet para snippets

2. **Testes**
   - Litmus para compatibilidade
   - WAVE para acessibilidade
   - BrowserStack para responsividade
   - Jest para testes unitários

3. **Otimização**
   - TinyPNG para imagens
   - HTML Minifier
   - CSS Minifier
   - Validadores online

### Processo de Desenvolvimento

1. **Criação**
   - Copiar template base
   - Adaptar estrutura
   - Adicionar estilos
   - Documentar variáveis

2. **Testes**
   - Validar HTML
   - Testar responsividade
   - Verificar acessibilidade
   - Testar variáveis

3. **Revisão**
   - Code review
   - Testes de compatibilidade
   - Validação de acessibilidade
   - Performance check

4. **Deploy**
   - Versionamento
   - Backup
   - Documentação
   - Monitoramento 
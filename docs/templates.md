# Módulo de Gerenciamento de Templates

## Visão Geral
O módulo de gerenciamento de templates permite criar, editar e gerenciar templates de notificação com suporte a versionamento e variáveis dinâmicas.

## Funcionalidades

### Templates
- Criação de templates com suporte a variáveis
- Edição de templates existentes
- Ativação/desativação de templates
- Visualização prévia com variáveis
- Categorização de templates
- Busca e filtros avançados
- Paginação de resultados

### Versionamento
- Histórico completo de versões
- Comparação entre versões
- Restauração de versões anteriores
- Rastreamento de mudanças
- Motivo das alterações

### Categorias
- Criação de categorias
- Edição de categorias
- Exclusão de categorias
- Associação de templates a categorias

## Estrutura de Dados

### Template
```typescript
interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
  categoryId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  changeReason?: string;
  currentVersion: number;
  versions: TemplateVersion[];
}
```

### Versão do Template
```typescript
interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
  categoryId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  changeReason: string;
}
```

### Categoria
```typescript
interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

### Templates
- `GET /api/templates` - Lista templates com paginação e filtros
- `GET /api/templates/:id` - Obtém detalhes de um template
- `POST /api/templates` - Cria um novo template
- `PATCH /api/templates/:id` - Atualiza um template
- `DELETE /api/templates/:id` - Remove um template
- `POST /api/templates/:id/preview` - Visualiza prévia do template

### Versões
- `GET /api/templates/versions` - Lista versões de um template
- `GET /api/templates/:id/versions/:version` - Obtém uma versão específica
- `POST /api/templates/:id/restore/:version` - Restaura uma versão anterior
- `GET /api/templates/:id/compare` - Compara duas versões

### Categorias
- `GET /api/template-categories` - Lista categorias
- `POST /api/template-categories` - Cria uma categoria
- `PATCH /api/template-categories/:id` - Atualiza uma categoria
- `DELETE /api/template-categories/:id` - Remove uma categoria

## Variáveis de Template

### Sintaxe
As variáveis são definidas usando a sintaxe `{{variavel}}` no corpo do template.

### Exemplo
```
Olá {{nome}},

Seu pedido {{numeroPedido}} foi processado com sucesso.
Total: R$ {{valorTotal}}

Atenciosamente,
Equipe de Vendas
```

### Variáveis Especiais
- `{{dataAtual}}` - Data atual formatada
- `{{horaAtual}}` - Hora atual formatada
- `{{empresa}}` - Nome da empresa
- `{{usuario}}` - Nome do usuário atual

## Boas Práticas

### Criação de Templates
1. Use nomes descritivos e únicos
2. Forneça descrições claras
3. Documente as variáveis necessárias
4. Teste o template com diferentes valores
5. Categorize adequadamente

### Versionamento
1. Sempre forneça um motivo para alterações
2. Mantenha versões anteriores por referência
3. Teste versões antes de restaurar
4. Documente mudanças significativas

### Categorias
1. Use categorias para organizar templates
2. Mantenha nomes de categorias concisos
3. Evite categorias muito específicas
4. Reorganize periodicamente

## Testes

### Testes Unitários
```bash
npm run test
```

### Testes de Integração
```bash
npm run test:integration
```

### Cobertura de Testes
```bash
npm run test:coverage
```

## Troubleshooting

### Problemas Comuns
1. **Template não renderiza**
   - Verifique se todas as variáveis foram fornecidas
   - Confirme a sintaxe das variáveis
   - Verifique caracteres especiais

2. **Erro ao restaurar versão**
   - Confirme se a versão existe
   - Verifique permissões
   - Confirme se o template está ativo

3. **Erro ao salvar template**
   - Verifique campos obrigatórios
   - Confirme tamanho máximo de campos
   - Verifique caracteres especiais

### Logs
Os logs de erro são armazenados em:
- Frontend: `logs/frontend.log`
- Backend: `logs/backend.log`

## Segurança

### Permissões
- Criação: `template:create`
- Edição: `template:edit`
- Exclusão: `template:delete`
- Visualização: `template:view`
- Versionamento: `template:version`

### Validações
- Sanitização de entrada
- Validação de tipos
- Verificação de permissões
- Rate limiting
- Proteção contra XSS

## Performance

### Otimizações
1. Paginação de resultados
2. Cache de templates
3. Lazy loading de versões
4. Compressão de respostas
5. Indexação de busca

### Monitoramento
- Tempo de resposta
- Uso de memória
- Taxa de erros
- Uso de CPU
- Queries lentas 
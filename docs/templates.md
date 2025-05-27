# Módulo de Gerenciamento de Templates

## Visão Geral
O módulo de gerenciamento de templates permite criar, editar e gerenciar templates de notificação com suporte a versionamento e variáveis dinâmicas.

## Templates de E-mail

### Tipos de Templates
1. **Default Notification** (`default_notification.html`)
   - Template base para notificações padrão
   - Suporte a variáveis dinâmicas
   - Design responsivo

2. **Alert Notification** (`alert_notification.html`)
   - Para alertas e notificações importantes
   - Suporte a níveis de prioridade
   - Botão de ação personalizado

3. **Password Reset** (`password_reset.html`)
   - Template específico para redefinição de senha
   - Link seguro de redefinição
   - Instruções claras

4. **Welcome** (`welcome.html`)
   - Boas-vindas para novos usuários
   - Instruções iniciais
   - Link de acesso ao sistema

5. **Error Notification** (`error_notification.html`)
   - Notificações de erros do sistema
   - Detalhes técnicos formatados
   - Informações de contexto

6. **Report Notification** (`report_notification.html`)
   - Notificações de relatórios
   - Suporte a anexos
   - Detalhes do relatório

7. **System Notification** (`system_notification.html`)
   - Notificações do sistema
   - Níveis de prioridade
   - Informações adicionais

8. **User Notification** (`user_notification.html`)
   - Notificações para usuários
   - Ações personalizadas
   - Confirmação de leitura

### Características Comuns
- Design responsivo
- Suporte a acessibilidade (ARIA)
- Meta tags para melhor renderização
- Estilos CSS consistentes
- Suporte a variáveis dinâmicas
- Rodapé padronizado
- Tradução em português

## Funcionalidades

### Templates
- Criação de templates com suporte a variáveis
- Edição de templates existentes
- Ativação/desativação de templates
- Visualização prévia com variáveis
- Categorização de templates
- Busca e filtros avançados
- Paginação de resultados
- Exportação/importação de templates
- Duplicação de templates
- Histórico de alterações

### Versionamento
- Histórico completo de versões
- Comparação entre versões
- Restauração de versões anteriores
- Rastreamento de mudanças
- Motivo das alterações
- Tags de versão
- Rollback automático
- Validação de versões

### Categorias
- Criação de categorias
- Edição de categorias
- Exclusão de categorias
- Associação de templates a categorias
- Hierarquia de categorias
- Ordenação de categorias
- Estatísticas por categoria

## Estrutura de Dados

### Template
```typescript
interface TemplateNotificacao {
  id: string;
  nome: string;
  descricao: string;
  assunto: string;
  corpo: string;
  variaveis: string[];
  idCategoria: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
  motivoAlteracao?: string;
  versaoAtual: number;
  versoes: VersaoTemplate[];
  metadados: {
    tags: string[];
    idioma: string;
    tipo: TipoTemplate;
    prioridade: Prioridade;
    tempoEstimado: number;
  };
  permissoes: {
    podeEditar: string[];
    podeVisualizar: string[];
    podeExcluir: string[];
  };
  estatisticas: {
    contagemUso: number;
    ultimoUso: string;
    avaliacaoMedia: number;
  };
}
```

### Versão do Template
```typescript
interface VersaoTemplate {
  id: string;
  idTemplate: string;
  versao: number;
  nome: string;
  descricao: string;
  assunto: string;
  corpo: string;
  variaveis: string[];
  idCategoria: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
  motivoAlteracao: string;
  alteracoes: {
    campo: string;
    valorAntigo: any;
    valorNovo: any;
  }[];
  statusValidacao: StatusValidacao;
  aprovadoPor?: string;
  dataAprovacao?: string;
}
```

### Categoria
```typescript
interface CategoriaTemplate {
  id: string;
  nome: string;
  descricao: string;
  dataCriacao: string;
  dataAtualizacao: string;
  idPai?: string;
  ordem: number;
  metadados: {
    icone?: string;
    cor?: string;
    eSistema: boolean;
  };
  estatisticas: {
    quantidadeTemplates: number;
    templatesAtivos: number;
    ultimaAtualizacao: string;
  };
}
```

## Endpoints da API

### Templates
- `GET /api/templates` - Lista templates com paginação e filtros
- `GET /api/templates/:id` - Obtém detalhes de um template
- `POST /api/templates` - Cria um novo template
- `PATCH /api/templates/:id` - Atualiza um template
- `DELETE /api/templates/:id` - Remove um template
- `POST /api/templates/:id/preview` - Visualiza prévia do template
- `POST /api/templates/:id/duplicate` - Duplica um template
- `POST /api/templates/:id/export` - Exporta um template
- `POST /api/templates/import` - Importa um template
- `GET /api/templates/:id/statistics` - Obtém estatísticas do template

### Versões
- `GET /api/templates/versions` - Lista versões de um template
- `GET /api/templates/:id/versions/:version` - Obtém uma versão específica
- `POST /api/templates/:id/restore/:version` - Restaura uma versão anterior
- `GET /api/templates/:id/compare` - Compara duas versões
- `POST /api/templates/:id/versions/:version/approve` - Aprova uma versão
- `POST /api/templates/:id/versions/:version/reject` - Rejeita uma versão
- `GET /api/templates/:id/versions/:version/changes` - Obtém mudanças da versão

### Categorias
- `GET /api/template-categories` - Lista categorias
- `POST /api/template-categories` - Cria uma categoria
- `PATCH /api/template-categories/:id` - Atualiza uma categoria
- `DELETE /api/template-categories/:id` - Remove uma categoria
- `GET /api/template-categories/:id/statistics` - Obtém estatísticas da categoria
- `POST /api/template-categories/:id/reorder` - Reordena categorias

## Variáveis de Template

### Variáveis Globais
- `{{currentYear}}` - Ano atual
- `{{title}}` - Título do e-mail
- `{{message}}` - Mensagem principal
- `{{priority}}` - Nível de prioridade
- `{{data}}` - Dados adicionais

### Variáveis Específicas
#### Welcome Template
- `{{name}}` - Nome do usuário
- `{{loginUrl}}` - URL de login

#### Password Reset
- `{{resetUrl}}` - URL de redefinição
- `{{expirationTime}}` - Tempo de expiração

#### Error Notification
- `{{error.message}}` - Mensagem de erro
- `{{error.stack}}` - Stack trace
- `{{error.context}}` - Contexto adicional
- `{{timestamp}}` - Data e hora do erro

#### Report Notification
- `{{reportType}}` - Tipo do relatório
- `{{reportName}}` - Nome do relatório
- `{{generatedAt}}` - Data de geração

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
- `{{dataFormatada}}` - Data formatada (aceita parâmetros)
- `{{moeda}}` - Formatação de moeda
- `{{numero}}` - Formatação de números
- `{{condicional}}` - Lógica condicional

### Formatação
```typescript
// Data
{{dataFormatada:DD/MM/YYYY}}

// Moeda
{{moeda:valor:pt-BR}}

// Número
{{numero:quantidade:pt-BR}}

// Condicional
{{#if condicao}}
  Conteúdo se verdadeiro
{{else}}
  Conteúdo se falso
{{/if}}
```

## Boas Práticas

### Criação de Templates
1. Use nomes descritivos e únicos
2. Forneça descrições claras
3. Documente as variáveis necessárias
4. Teste o template com diferentes valores
5. Categorize adequadamente
6. Adicione tags relevantes
7. Defina permissões apropriadas
8. Configure metadados úteis
9. Mantenha consistência visual
10. Implemente acessibilidade

### Acessibilidade
1. Use atributos ARIA apropriados
2. Mantenha contraste adequado
3. Forneça textos alternativos
4. Estruture o HTML semanticamente
5. Teste com leitores de tela

### Responsividade
1. Use media queries
2. Teste em diferentes dispositivos
3. Mantenha legibilidade
4. Adapte botões e links
5. Otimize imagens

### Versionamento
1. Sempre forneça um motivo para alterações
2. Mantenha versões anteriores por referência
3. Teste versões antes de restaurar
4. Documente mudanças significativas
5. Use tags para marcar versões importantes
6. Implemente processo de aprovação
7. Mantenha histórico de validação
8. Configure rollback automático

### Categorias
1. Use categorias para organizar templates
2. Mantenha nomes de categorias concisos
3. Evite categorias muito específicas
4. Reorganize periodicamente
5. Implemente hierarquia quando necessário
6. Use ícones e cores para identificação
7. Mantenha estatísticas atualizadas
8. Configure permissões por categoria

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

### Testes de Performance
```bash
npm run test:performance
```

## Troubleshooting

### Problemas Comuns
1. **Template não renderiza**
   - Verifique se todas as variáveis foram fornecidas
   - Confirme a sintaxe das variáveis
   - Verifique caracteres especiais
   - Teste com dados de exemplo
   - Verifique logs de erro

2. **Erro ao restaurar versão**
   - Confirme se a versão existe
   - Verifique permissões
   - Confirme se o template está ativo
   - Verifique conflitos de versão
   - Consulte histórico de alterações

3. **Erro ao salvar template**
   - Verifique campos obrigatórios
   - Confirme tamanho máximo de campos
   - Verifique caracteres especiais
   - Valide formato das variáveis
   - Consulte logs de validação

### Logs
Os logs de erro são armazenados em:
- Frontend: `logs/frontend.log`
- Backend: `logs/backend.log`
- Validação: `logs/validation.log`
- Performance: `logs/performance.log`
- Auditoria: `logs/audit.log`

## Segurança

### Permissões
- Criação: `template:criar`
- Edição: `template:editar`
- Exclusão: `template:excluir`
- Visualização: `template:visualizar`
- Versionamento: `template:versionar`
- Aprovação: `template:aprovar`
- Exportação: `template:exportar`
- Importação: `template:importar`

### Validações
- Sanitização de entrada
- Validação de tipos
- Verificação de permissões
- Rate limiting
- Proteção contra XSS
- Validação de variáveis
- Verificação de tamanho
- Validação de formato

## Performance

### Otimizações
1. Paginação de resultados
2. Cache de templates
3. Lazy loading de versões
4. Compressão de respostas
5. Indexação de busca
6. Cache de categorias
7. Otimização de queries
8. Compressão de assets

### Monitoramento
- Tempo de resposta
- Uso de memória
- Taxa de erros
- Uso de CPU
- Queries lentas
- Cache hit ratio
- Taxa de validação
- Uso de recursos 
# Changelog

## [Unreleased]

### Changed
- Refatoração completa das rotas Express para melhor organização e clareza:
  - Renomeados parâmetros genéricos para nomes mais descritivos (ex: `:id` -> `:userId`, `:saleId`, `:customerId`)
  - Organização das rotas em seções lógicas (base routes, specific routes)
  - Adicionada validação consistente para todos os parâmetros
  - Melhorada a estrutura de autenticação e autorização
  - Padronização dos nomes de rotas e métodos HTTP
  - Removidos protocolos/domínios desnecessários das rotas

### Added
- Novos schemas de validação para parâmetros de rota
- Documentação atualizada sobre convenções de rotas
- Exemplos de uso das novas rotas

### Fixed
- Corrigido problema de "Missing parameter name" em rotas Express
- Melhorada a validação de parâmetros em todas as rotas
- Padronização da estrutura de validação usando `params`, `query` e `body`

## [0.1.0] - 2024-03-20

### Added
- Configuração inicial do projeto
- Estrutura básica do backend com Express e TypeScript
- Rotas iniciais para produtos, vendas, clientes e usuários
- Sistema de autenticação e autorização
- Validação de dados com middleware personalizado
- Documentação inicial do projeto

### Changed
- Nenhuma mudança significativa

### Fixed
- Nenhum bug reportado

### Corrigido
- Corrigido erro "Missing parameter name" em rotas Express
  - Refatorado parâmetros de rota para usar nomes mais descritivos
  - Atualizado `:number` para `:receiptNumber` em rotas de recibos
  - Atualizado `:id` para `:paymentId` em rotas de pagamento
  - Melhorada validação de parâmetros em todas as rotas
  - Adicionada estrutura correta para validação de parâmetros usando `params`, `query` e `body`

### Convenções de Rotas
Para manter a consistência no projeto, siga estas convenções ao criar novas rotas:

1. Nomes de Parâmetros:
   - Use nomes descritivos para parâmetros de rota
   - Exemplo: `:userId` em vez de `:id` para rotas de usuário
   - Exemplo: `:productId` em vez de `:id` para rotas de produto

2. Validação de Parâmetros:
   ```typescript
   const schema = {
     params: {
       id: { type: 'number', required: true, min: 1 }
     },
     query: {
       // parâmetros de query
     },
     body: {
       // parâmetros do corpo
     }
   };
   ```

3. Estrutura de Rotas:
   - Agrupe rotas relacionadas
   - Use middleware de autenticação e autorização apropriadamente
   - Valide parâmetros antes de processar a requisição 
# Changelog

## [Não Lançado]

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
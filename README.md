# Evidence Reps — Fases 1 e 3

Agregador de acessórios de treino baseados em evidências. Catálogo, detalhe de
produto, painel administrativo e venda com checkout próprio (carrinho, Pix/cartão
e acompanhamento de pedido). O plano completo está em `../PLANO-TECNICO.md`.

**Modelo de revenda:** o cliente paga no site; o operador compra no fornecedor com
seu próprio pagamento e envia direto ao cliente. Nunca pedimos CPF nem dados de
cartão do cliente para a loja parceira.

## Stack

- Next.js 16 (App Router, Cache Components, Partial Prefetching)
- React 19 + TypeScript + Tailwind CSS 4
- Supabase (Postgres, Auth, Storage)
- Zod para validação
- Mercado Pago (Pix e cartão), com modo demo para testar sem cobrar

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npm run dev
```

Abra http://localhost:3000.

Sem variáveis de ambiente, o site usa um **catálogo de demonstração** com 12
produtos. Com Supabase configurado, catálogo, variantes e pedidos vêm do banco.

## Configurar Supabase

1. Crie um projeto em https://supabase.com.
2. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key)
   - `SUPABASE_SERVICE_ROLE_KEY` (secret key — somente servidor)
3. No SQL Editor do Supabase, execute `supabase/migrations/0001_init.sql`.
4. Crie o primeiro admin:
   - Supabase > Authentication > Users > Add user (e-mail/senha)
   - Depois, no SQL Editor:

```sql
insert into admins (user_id)
select id from auth.users where email = 'voce@exemplo.com';
```

5. Popular o catálogo com os 12 produtos de demonstração:

```bash
node --env-file=.env.local scripts/seed.mjs
```

6. Acesse `/admin/login` e entre.

## Pagamento

Variáveis em `.env.local`:

| Variável | Uso |
|---|---|
| `PAYMENT_MODE` | `demo` (padrão) ou `live` |
| `NEXT_PUBLIC_SITE_URL` | URL base para `back_urls` e webhook |
| `MERCADO_PAGO_ACCESS_TOKEN` | Necessário apenas em `live` |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Necessário apenas em `live` (valida assinatura HMAC) |

### Modo demo (padrão)

1. Adicione um produto ao carrinho e vá para `/checkout`.
2. Preencha nome, e-mail, WhatsApp e endereço (ViaCEP preenche CEP/endereço).
3. Clique em **Finalizar pedido** — o pedido é criado em `pending_payment` e o
   carrinho é limpo.
4. Em `/pedido/[code]`, clique em **Simular pagamento aprovado**.
5. O status muda para `paid` e aparece em `/admin/pedidos`.

Nenhuma cobrança é feita no modo demo.

### Modo live (Mercado Pago)

1. Obtenha access token e webhook secret em https://www.mercadopago.com.br/developers.
2. Preencha as variáveis e mude `PAYMENT_MODE=live`.
3. Cadastre `https://seu-dominio/api/webhooks/pagamento` como URL de notificação.
4. Pix gera QR Code na página do pedido; cartão redireciona para o checkout do
   gateway. A confirmação **sempre** vem do webhook assinado, nunca do navegador.

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Home (hero, categorias, destaques) |
| `/produtos` | Catálogo com filtro e busca |
| `/produto/[slug]` | Detalhe, variantes, adicionar ao carrinho e link da loja parceira |
| `/carrinho` | Itens, quantidades e resumo |
| `/checkout` | Dados, entrega (ViaCEP) e forma de pagamento |
| `/pedido/[code]` | Acompanhamento do pedido e pagamento |
| `/admin/login` | Login do painel |
| `/admin/produtos` | Lista, edição e exclusão de produtos |
| `/admin/pedidos` | Fila de pedidos |
| `/api/webhooks/pagamento` | Webhook do Mercado Pago |
| `/sitemap.xml`, `/robots.txt` | SEO básico |

## Cache

`getProducts()`, `getProductBySlug()` e `getCategories()` usam `use cache` com
`cacheLife` e `cacheTag`. O painel chama `updateTag("products")` após criar,
editar ou excluir produtos. Páginas protegidas usam `instant = false` e
`connection()` para evitar prerender com dados de usuário.

## Segurança

- A chave `service_role` é usada apenas em código de servidor.
- RLS habilitado: catálogo legível por todos; tabelas de clientes/pedidos sem
  acesso público.
- Webhook valida assinatura HMAC e usa `webhook_events` para idempotência.
- Preços e regras de frete são recalculados no servidor; o navegador envia só
  IDs e quantidades.
- Dados de cartão/Pix nunca são armazenados — ficam no gateway.

## Validação

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Build de referência: 29 páginas, `/api/webhooks/pagamento` como rota dinâmica.

## Próximas fases

- Fase 2: import CSV, atualização de preços via Edge Function, blog science based
- Fase 4: fila de compra, custo/margem, rastreio e notificações (e-mail/WhatsApp)
- Fase 5/6: analytics, afiliados, automação/logística e integrações com ERP

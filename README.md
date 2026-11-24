# Evidence Reps — Fases 1, 3 e 4

Agregador de acessórios e equipamentos de treino. Catálogo, detalhe de produto,
painel administrativo e venda com checkout próprio (carrinho, Pix/cartão e
acompanhamento de pedido). O plano completo está em `../PLANO-TECNICO.md`.

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

Sem variáveis de ambiente, o site usa um **catálogo local** com 22 produtos e 8
categorias. Com Supabase configurado, catálogo, variantes e pedidos vêm do banco.

Os 22 produtos são **reais**: cada um corresponde a um anúncio verificado no
browser logado da Shopee, com título, especificações, custo e fotos locais em
`public/products/` (66 JPEGs, 1 a 5 por produto). As categorias novas são
**Suporte e Proteção** (cinturão, wrist wraps, faixa de joelho, almofada) e
**Equipamentos de Treino** (presilhas, barra, step, colete, halteres). A categoria
`microloading` mantém o slug, mas se chama **Anilhas e Carga** — as anilhas
disponíveis são de 1 kg e 1,25 kg, não microcargas de 0,25 kg. As fotos são dos
anúncios e o uso foi autorizado pelo operador; guarde o comprovante da autorização.

O link do fornecedor (`source_url`) fica apenas no banco e aparece no painel
admin (fila de compra e `/admin/fornecedor`); `publicProduct()` o remove antes de
enviar produtos ao navegador do cliente.

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

5. Popular o catálogo com os 22 produtos reais, semear os 22 itens monitorados e remover slugs antigos:

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
3. Cadastre `https://seu-dominio/api/webhooks/pagamento` como URL de notificação
   com o evento **Pagamentos** (`payment`).
4. **Para Pix, é obrigatório ter uma chave Pix cadastrada na conta do Mercado Pago.**
   Sem chave, a API retorna `Collector user without key enabled for QR render`.
5. Pix gera QR Code na página do pedido; cartão redireciona para o checkout do
   gateway. A confirmação **sempre** vem do webhook assinado, nunca do navegador.

### Produção (24/11/2026)

- URL em uso: `https://evidence-reps-lojha.vercel.app`. O Vercel gera o domínio
  automático com o slug da conta (`lojha`) quando o nome `evidence-reps` é usado;
  o endereço curto `evidence-reps.vercel.app` não foi atribuído ao projeto.
- O alias antigo `lojascec.vercel.app` foi removido no painel e não deve ser usado.
- Domínio próprio `www.evidencereps.com.br` segue adiado por custo; quando for
  registrado, basta apontá-lo para o mesmo projeto.
- Webhook: `https://evidence-reps-lojha.vercel.app/api/webhooks/pagamento`, evento
  `payment`, assinatura HMAC validada (401 sem assinatura, 200 com assinatura correta).
- Pix e preferência de cartão criados com sucesso pela API real. Teste real de
  R$ 1,00 conduzido com pedido temporário, confirmação por webhook, estorno e
  limpeza dos dados temporários.

## Fila de pedidos (Fase 4)

Em `/admin/pedidos`, cada pedido abre o detalhe em `/admin/pedidos/[id]`. O fluxo
do operador é:

1. **Iniciar compra** (`paid` → `purchasing`) no fornecedor, usando seu próprio
   pagamento — nunca o cartão/CPF do cliente.
2. **Registrar compra** (`purchasing` → `purchased`): informe custo em reais, ID
   do pedido no fornecedor e observações opcionais.
3. **Registrar envio** (`purchased` → `shipped`): informe o código de rastreio.
4. **Marcar entregue** (`shipped` → `delivered`).
5. Cancelamento, reembolso e expiração de `pending_payment` também são feitos no
   detalhe. Transições inválidas são bloqueadas.

O detalhe calcula a margem estimada:
`total - custo - frete - taxa do gateway`. A taxa é uma estimativa configurável
em `settings` (valores padrão se as chaves não existirem):

| Chave | Padrão | Uso |
|---|---|---|
| `gateway_fee_pix_bps` | `100` | Taxa Pix em pontos-base (1%) |
| `gateway_fee_card_bps` | `399` | Taxa de cartão em pontos-base (3,99%) |
| `gateway_fee_fixed_cents` | `30` | Valor fixo por transação, em centavos |
| `whatsapp_number` | `""` | Número usado nos links `wa.me` (com DDI) |

### Frete por região

O frete cobrado no checkout é calculado pela UF do endereço (`src/lib/shipping.ts`),
com base em medições feitas em 24/11/2026 no checkout logado da Shopee para o
anúncio da polia baixa enviado de Salvador/BA:

| Região | Estados | Frete cobrado | Frete medido na Shopee |
|---|---|---|---|
| Sudeste | SP, RJ, MG, ES | R$ 9,90 | R$ 8,39–9,62 |
| Sul | PR, SC, RS | R$ 10,90 | R$ 10,29 |
| Centro-Oeste | GO, DF, MS, MT | R$ 13,90 | R$ 10,83–13,25 |
| Nordeste | BA, SE, AL, PE, PB, RN, CE, PI, MA | R$ 15,90 | R$ 12,04–15,69 |
| Norte | AC, RO, AM, PA, TO | R$ 24,90 | R$ 22,65 |
| Norte (RR e AP) | RR, AP | R$ 39,90 | R$ 33,59–39,66 |

Cobramos o maior valor medido de cada região, arredondado para cima, para não
absorver a diferença na compra do fornecedor. A regra de frete grátis
(`free_shipping_threshold_cents`, padrão R$ 299,00) continua valendo. A chave
antiga `flat_shipping_cents` não é mais usada.

Os 13 itens foram precificados pela regra abaixo, com custos entre R$ 13,75 e
R$ 35,90 e preços entre R$ 37,90 e R$ 59,90. No caso do par de polia baixa, o
preço é **R$ 49,90** (custo R$ 26,32 na Shopee). Descontando o custo, o frete real
e a taxa do gateway, o lucro estimado é de R$ 22,96 no Pix e R$ 21,17 no cartão
no Sudeste, ficando entre R$ 19,94 e R$ 24,78 em todas as regiões.

### Checagem diária do fornecedor

O programa de afiliados da Shopee exige perfil de influenciador e o Open
Platform não resolve sem CNPJ (o perfil *Seller* só serve para lojas próprias e
o de *Third-party Partner* exige documento). Por isso, a fonte autorizada hoje é
o próprio operador: em `/admin/fornecedor`, informe uma vez por dia o **custo**
visto no anúncio e se ele está **disponível**. O site aplica:

- **Preço:** `custo do fornecedor + R$ 23,58`, arredondado para cima até
  terminar em `,90`. Com custo de R$ 26,32 o preço continua R$ 49,90.
- **Disponibilidade:** se você marcar indisponível, o produto fica
  `out_of_stock` e o checkout bloqueia a venda mesmo que alguém tenha mudado o
  status manualmente. Ao marcar disponível novamente, o status anterior é
  restaurado; um produto esgotado manualmente não é reativado.
- **Auditoria:** cada registro fica no histórico (30 entradas) com data, custo,
  preço antes/depois e origem `manual`.

O estado vive na chave `supplier_monitor` da tabela `settings`; nenhuma nova
coluna ou migration é necessária. O preço usado no checkout é recalculado no
servidor a partir desse custo, não confiado ao navegador.

Quando existir uma fonte autorizada de verdade, o job pronto em
`/api/cron/supplier-check` pode ser reativado: basta configurar as variáveis
abaixo e adicionar o `cron` ao `vercel.json`. O adaptador isolado em
`src/lib/supplier-quote.ts` aceita `price_cents`/`price` e
`available`/`in_stock`/`status`; ele nunca usa cookies de sessão.

| Variável | Uso futuro |
|---|---|
| `CRON_SECRET` | Vercel envia `Authorization: Bearer <valor>`; sem ele a rota responde 503 |
| `SUPPLIER_QUOTE_URL` | Endpoint HTTPS da fonte autorizada; sem ele o job não roda |
| `SUPPLIER_QUOTE_TOKEN` | Bearer token da fonte, se exigido |
| `SUPPLIER_QUOTE_ITEM_PARAM` | Nome do parâmetro de item (padrão `item_id`) |
| `SUPPLIER_QUOTE_TIMEOUT_MS` | Timeout por consulta em ms (padrão `10000`) |

As notificações são links gerados no painel (`mailto:` e `wa.me`), sem serviço
pago. O cliente vê o status e o rastreio em `/pedido/[code]`.

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
| `/admin/pedidos` | Fila de pedidos com custo e margem |
| `/admin/pedidos/[id]` | Detalhe, ações de compra/envio e notificações |
| `/admin/fornecedor` | Custo/disponibilidade do fornecedor e histórico (checagem manual) |
| `/api/webhooks/pagamento` | Webhook do Mercado Pago |
| `/api/health` | Healthcheck público (200 só quando o banco responde) |
| `/api/cron/supplier-check` | Job futuro, protegido por `CRON_SECRET`; desativado sem fonte autorizada |
| `/sitemap.xml`, `/robots.txt` | SEO básico |

## Cache

`getProducts()`, `getProductBySlug()` e `getCategories()` usam `use cache` com
`cacheLife` e `cacheTag`. O painel chama `updateTag("products")` após criar,
editar ou excluir produtos. Páginas protegidas usam `instant = false` e
`connection()` para evitar prerender com dados de usuário.

## Segurança

- Headers em todas as respostas via `next.config.ts`: CSP, HSTS, `nosniff`,
  `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy` e `Permissions-Policy`.
  O CSP usa `'unsafe-inline'` para os scripts do Next/JSON-LD; nonce exigiria
  renderização dinâmica e quebraria `cacheComponents`/`partialPrefetching`.
  `connect-src` inclui `https://viacep.com.br`, usado pelo formulário de CEP.
- A chave `service_role` é usada apenas em código de servidor.
- RLS habilitado: catálogo legível por todos; tabelas de clientes/pedidos sem
  acesso público.
- `/pedido/[code]` mostra só primeiro nome, e-mail/telefone parciais e cidade/UF;
  rua, número, CEP e demais dados não são renderizados.
- Webhook valida assinatura HMAC, limita o corpo a 64 KB e só registra o evento
  depois de consultar o pagamento. Se o gateway falhar, o evento fica livre para
  reenvio.
- Erros do Supabase/gateway nunca são devolvidos ao navegador: checkout e painel
  usam mensagens genéricas. `error.tsx` e `global-error.tsx` cobrem falhas de UI.
- Preços e frete por UF são recalculados no servidor; o navegador envia só
  IDs, quantidades e o endereço (a tabela de frete não é confiada ao cliente).
- Dados de cartão/Pix nunca são armazenados — ficam no gateway.
- CI em `.github/workflows/ci.yml` roda lint, `next typegen` + `tsc`, testes e
  build em cada push ou PR para `main`.

## Validação

```bash
npx next typegen   # necessário em checkout limpo: gera .next/types
npx tsc --noEmit
npm run lint
npm test
npm run build
```

`npm test` compila os helpers/testes para `.test-dist/` (ignorado pelo Git e pelo
ESLint) e roda a suíte `node:test` sem dependências extras: pedidos/taxas, filtros
e CSV do painel, URL canônica, URLs de parceiro, escape de JSON-LD, máscara de
PII, assinatura HMAC do webhook e schemas de produto/notificação.

Build de referência: 44 páginas, com `/api/webhooks/pagamento`, `/api/health` e
`/api/cron/supplier-check` como rotas dinâmicas.

## Próximas fases

Fora de escopo: domínio próprio e Fase 0 (CNPJ/contador/notas/páginas legais).

- Onda 2 — confiança e conversão: FAQ, contato/trocas, breadcrumbs, `lastmod` no
  sitemap, compatibilidade no PDP e avaliações verificadas.
- Onda 3 — operação: backups, Sentry, e-mails transacionais, rate limiting e
  migração para `sb_publishable_`/`sb_secret_` (dependem de orçamento).
- Onda 4 — crescimento: analytics com consentimento, UTM, cupom, recuperação de
  carrinho, WebP/AVIF e medição de Core Web Vitals.

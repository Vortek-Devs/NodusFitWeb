# Nodus Fit Web

Frontend Next.js e BFF do Nodus Fit, com os componentes e tokens do projeto.

## Arquitetura de autenticação

Os fluxos de BetterAuth, Google OAuth, convite vinculado ao `state` e BFF da
NodusAPI estão descritos em [docs/auth-flow.md](docs/auth-flow.md).

## Ambiente local

O frontend usa `.env.local`, que é ignorado pelo Git. Para criar a configuração
local a partir do template:

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm ci
```

O template aponta o BetterAuth para o PostgreSQL local do Supabase em
`127.0.0.1:54322` e a NodusAPI para `http://localhost:5266`, perfil HTTP do
backend C#. Preencha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` somente quando
for testar o OAuth do Google.

Use npm e o `package-lock.json` versionado. Os testes com jsdom requerem Node
`^22.22.2 || ^24.15.0 || >=26`; Node 24.19 satisfaz esse requisito. `npm ci` recria
`node_modules`: pare servidores, testes e builds antes da instalação. Não sobrescreva
uma configuração `.env.local` existente nem versione segredos.

### Confirmação de e-mail

Acesso por senha exige e-mail verificado. BetterAuth gera o link, envia na criação
da conta e na tentativa de login sem verificação, e inicia a sessão após confirmar.
O link expira em uma hora. No cadastro, o envio automático é `best-effort`: o
BetterAuth captura e registra uma rejeição do callback, portanto a resposta de
cadastro não comprova que o provedor aceitou a mensagem. No reenvio explícito, o
callback é aguardado e falhas de configuração, rede ou provedor retornam à UI.

Para envio externo, configure em runtime `RESEND_API_KEY` e `AUTH_EMAIL_FROM`
(remetente pertencente a um domínio verificado no Resend), além de
`BETTER_AUTH_URL` com a origem real da autenticação. Essas variáveis de envio
ficam vazias no template e não são exigidas durante o build. Ausência de
configuração falha somente ao executar o envio, com `EMAIL_DELIVERY_NOT_CONFIGURED`;
falhas de URL, rede ou provedor geram `EMAIL_DELIVERY_FAILED` sem dados sensíveis.
Mesmo quando o reenvio responde com sucesso, há prova apenas da aceitação pelo
provedor, não da entrega na caixa de entrada.

Os testes usam `fetch` simulado. Nenhuma mensagem externa foi enviada nesta etapa;
comprovar entrega exige domínio verificado, segredos reais e validação runtime.

## Desenvolvimento e validação

```powershell
npm run dev
```

Abra [localhost:3000](http://localhost:3000). Para validar localmente:

```powershell
npm ci
npm test
npm run lint:ci
npm run type-check
npm run build
git diff --check
```

Esses comandos são verificações a executar, não uma declaração de aprovação.
O build pode precisar de acesso às fontes Google configuradas pelo projeto.
Testes, lint, build, auditoria de dependências, autenticação ponta a ponta e deploy
são verificações distintas. Pendências de segurança e compatibilidade precisam ser
resolvidas antes de considerar a validação completa.

Estado local de 20/09/2026: 341 testes em 20 arquivos, Biome em 95 arquivos e
TypeScript passaram. A configuração BetterAuth também foi revalidada sem o plugin
`bearer`, com cadastro Google somente explícito, convite OAuth vinculado ao `state`,
convite por e-mail fail-closed e reenvio de verificação aguardado. O build Webpack
do diff atual compilou, passou pelo TypeScript e gerou 18/18 páginas com exit 0.
No Windows, o build Turbopack gerou as páginas, mas não encerrou o processo. O
workflow fornece um segredo BetterAuth
exclusivo do build de CI, sem usar credenciais de produção. GitHub Actions,
autenticação real ponta a ponta, envio real de e-mail e deploy seguem sem prova.

Estado local da Fatia 1 em 21/09/2026: 396 testes em 24 arquivos, TypeScript e
Biome em 108 arquivos passaram. O build de produção do Next.js 16 compilou,
validou tipos e gerou 20/20 páginas, incluindo `/exercicios`,
`/exercicios/novo` e `/exercicios/[exerciseId]`. A primeira execução no sandbox
ficou aguardando o download de `next/font/google`; a repetição autorizada com
rede terminou com exit `0`. O smoke autenticado contra a NodusAPI/Supabase local
continua pendente e não é substituído pelos testes de componentes.

Estado local do recorte colaborativo em 24/09/2026: 427 testes em 27 arquivos,
TypeScript, Biome nos 85 arquivos do escopo e build Next com Webpack (21/21
páginas) passaram. `npm ci` não pôde ser repetido neste host porque o npm
global falha internamente em `minipass-flush`; o CI em checkout limpo deve
confirmar instalação e build padrão antes da integração.

## BFF e fronteira de identidade

- Web: `/api/backend/[...path]`, com sessão BetterAuth do navegador.
- Mobile: `/api/mobile/backend/[...path]`, com a sessão BetterAuth enviada pelo app.
- Convite público mobile: `/api/mobile/public/invites/[token]`.
- Preparação/aceite de convite: `/api/registration-invites/prepare` e
  `/api/registration-invites/accept`.

O BFF valida a sessão, obtém o JWT curto da ponte BetterAuth e o envia à NodusAPI
como `Authorization: Bearer`. Esse JWT de domínio fica no servidor; não é devolvido
ao cliente pelo proxy. A API deriva identidade e permissões da autenticação canônica,
não de `userId`, `personalId` ou `role` fornecidos pelo cliente.

A sessão BetterAuth aceita somente o cookie do cliente; o plugin `bearer` não faz
parte da configuração. O plugin `jwt()` permanece apenas para emitir o token interno
usado pelo BFF ao chamar a NodusAPI.

Login Google existente usa `requestSignUp: false`. Cadastro Google ocorre somente
por uma ação explícita com `requestSignUp: true`; a intenção `PERSONAL` ou `ALUNO`
e o token opaco do convite, quando aplicável, ficam no estado OAuth temporário
gerenciado pelo BetterAuth. Não existe cookie global de convite compartilhado entre
abas. O callback revalida convite e e-mail antes de persistir a role.

Cabeçalhos de requisição encaminhados: `accept`, `content-type` e `if-none-match`.
O BFF define o `authorization` de saída e descarta `x-correlation-id` recebido do
cliente; a NodusAPI gera uma correlação nova. Cabeçalhos de resposta permitidos:
`content-type`, `retry-after` e `x-correlation-id`. `Location`, cookies da API e
`set-auth-jwt` não são repassados. O proxy usa `no-store`, cancelamento por sinal e
redirecionamento manual.

## Alunos

`/alunos` lista os vínculos reais do personal autenticado; `/alunos/[studentId]`
mostra os campos canônicos disponíveis do aluno. A API aplica ownership. O acesso
exige conta verificada, ativa, não banida e papel adequado.

A URL controla `page`, `search`, `status`, `sortBy` e `sortDirection`; `pageSize` é
fixo em 20 nesta etapa. A busca tem debounce de 300ms. Status: `ACTIVE`/`INACTIVE`;
ordenação: `name`/`linkedAt`, direção `asc`/`desc`. TanStack Query e Table usam
paginação, busca e ordenação do servidor. Tabela desktop e cards mobile compartilham
os campos, incluindo vínculo.

As telas distinguem carregamento, ausência de vínculos, filtros sem resultado,
página fora da faixa e falhas de acesso/serviço. Não há métricas de treino inventadas
nem botão de criação de convite sem fluxo implementado nessa rota.

## Exercícios

`/exercicios` reúne itens do sistema e exercícios do personal autenticado. A URL
controla `page`, `search`, `status`, `ownership`, `equipmentId`, `muscleGroupId`,
`sortBy` e `sortDirection`; `pageSize` permanece 20. TanStack Query cancela
consultas obsoletas e TanStack Table mantém paginação, ordenação e filtros no
servidor. A interface usa tabela no desktop e cards equivalentes no mobile web.

`/exercicios/novo` cria conteúdo próprio. `/exercicios/[exerciseId]` permite editar
e arquivar apenas item customizado do usuário; exercícios do sistema e arquivados
são exibidos em modo somente leitura. As mutações geram UUID de operação, enviam a
versão esperada quando necessária, invalidam cache somente após resposta canônica e
mostram conflitos/Problem Details com código e correlação. O arquivamento exige
confirmação acessível e aceita cancelamento por teclado.

Estas telas reutilizam `Button`, `Input`, `Table`, `Badge` e os tokens existentes
em `globals.css`. Nenhuma cor, tipografia, primitiva ou dependência visual paralela
foi criada; nenhum código, texto, CSS, dado ou asset do OpenGym foi copiado.

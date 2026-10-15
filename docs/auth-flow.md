# Fluxo de autenticacao BetterAuth e NodusAPI

Este documento explica como as partes se conectam e onde cada responsabilidade
fica. A implementacao correspondente esta dividida entre este repositorio e a
NodusAPI C#. A disponibilidade remota depende da configuracao e implantacao de cada ambiente.

## Regra principal

```text
Browser -> Next.js/BetterAuth -> JWT curto -> NodusAPI -> PostgreSQL
```

- O browser conhece somente o cookie de sessao BetterAuth.
- O Next.js valida essa sessao e atua como BFF.
- O BFF solicita um JWT ES256 de 15 minutos ao BetterAuth.
- A NodusAPI valida esse JWT usando o endpoint publico de JWKS.
- Apenas backend e BFF acessam as tabelas PostgreSQL.

O JWT nao e salvo em `localStorage`, nao e retornado ao browser e nao substitui
a sessao BetterAuth. Ele serve somente como credencial curta entre servidores.
A configuracao BetterAuth nao inclui o plugin `bearer`: a sessao recebida do cliente
e exclusivamente por cookie. O plugin `jwt()` permanece apenas para emitir a
credencial interna usada pelo BFF ao chamar a NodusAPI.

Para manter essa fronteira, BetterAuth desabilita o endpoint público `/token` e a
rota HTTP Next.js responde `404` para `/api/auth/token` antes de encaminhar a
requisição. A rota HTTP `/api/auth/*` também remove `set-auth-jwt` de todas as
respostas ao browser. O BFF chama `auth.api.getSession` diretamente no servidor e
continua lendo o header interno; o bloqueio e o filtro só cobrem respostas HTTP
públicas.

Isso evita entregar ao JavaScript do browser um bearer reutilizável para chamadas
diretas à API. Se esse JWT vazar, ele pode continuar válido até expirar mesmo que a
sessão por cookie seja encerrada. Por isso, o plugin `jwt()` não é removido: só o
BFF server-side pode obter a credencial de serviço, e o browser recebe apenas o
cookie BetterAuth.

## Login por e-mail ou Google

1. O browser chama uma rota em `/api/auth/*`.
2. BetterAuth executa login, cadastro explícito ou callback Google.
3. BetterAuth cria ou recupera `users`, `accounts` e `sessions`.
4. O browser recebe apenas o cookie de sessao.
5. Ao chamar uma funcionalidade de dominio, o browser usa `/api/backend/*`.
6. O BFF valida a sessao, obtem o JWT e chama a NodusAPI.

O provedor Google tem cadastro implícito desabilitado. Login existente usa
`requestSignUp: false`; somente as ações explícitas de cadastro usam
`requestSignUp: true`. A intenção de cadastro e, para aluno, o token opaco ficam nos
dados temporários vinculados ao `state` nativo gerenciado pelo BetterAuth. Com o
banco configurado, o callback valida a correlação e consome o registro temporário;
um `state` ausente, trocado ou malformado falha fechado. Não há cookie global de
convite nem role escolhida pelo formulário.

## Confirmacao de e-mail

No cadastro, o envio automatico e `best-effort`: quando o callback de entrega
rejeita, o BetterAuth captura e registra a falha sem converter a resposta do signup
em erro. No reenvio explicito, o callback e aguardado diretamente; falhas de
configuracao, rede ou provedor retornam a UI. Uma resposta positiva comprova apenas
que o provedor aceitou a mensagem, nao que ela chegou a caixa de entrada.

## Definicao da role

A role nao e aceita em formulario nem em JSON de cadastro.

- Cadastro aberto sem intencao explicita de convite: `PERSONAL`.
- Cadastro com convite explicito valido e e-mail correspondente: `ALUNO`.
- Convite explicito invalido, expirado, indisponivel ou impossivel de validar:
  cadastro abortado, sem fallback para `PERSONAL`.

Essa decisao acontece no hook server-side `user.create.before`. Mesmo que o
browser envie `role: "ADMIN"` ou `role: "ALUNO"`, o campo BetterAuth possui
`input: false` e o valor enviado e ignorado.

## Convite com Google OAuth

1. A tela recebe o token puro pela URL.
2. O frontend chama `POST /api/registration-invites/prepare`.
3. O BFF valida o token na rota pública da NodusAPI e não grava cookie.
4. O cadastro Google explícito chama `signIn.social` com `requestSignUp: true`,
   intenção `student` e token em `additionalData`.
5. BetterAuth vincula esses dados ao `state` OAuth temporário.
6. No callback, o hook obtém somente o estado validado pelo BetterAuth.
7. O hook consulta novamente o convite e compara o e-mail canônico.
8. Somente convite `ALUNO` válido, vinculado ao fluxo atual e com e-mail igual
   produz role `ALUNO`.

No web, o login Google comum iniciado por link de convite usa
`requestSignUp: false`, mas preserva o token na URL de callback. Após validar
`/me`, a tela aceita o convite antes de navegar para `/aluno`. Login por
e-mail/senha com o mesmo link faz a mesma aceitação após confirmar a role canônica.
Se o aceite falhar, nenhum dos fluxos redireciona para a área do aluno.

Cadastro aberto de personal também é explícito e leva intenção `personal`, sem
token. Um login Google comum nunca cria conta. Abas concorrentes não compartilham
contexto de convite: um callback sem o `state` correspondente falha, em vez de usar
o convite iniciado por outro fluxo.

## Convite web e nativo por e-mail

O cadastro de aluno por e-mail no web e no Expo envia a intencao explicitamente.
O app nativo não combina cookie de sessão com bearer paralelo.

1. O cliente valida o token pela rota publica correspondente.
2. O request `signUp.email` envia o token opaco somente no header explicito
   `x-nodus-invite-token`; no app, inclui tambem o callback `nodusfit://`.
3. O hook BetterAuth aceita apenas token `base64url` entre 1 e 128 caracteres,
   consulta novamente a NodusAPI e compara o e-mail do convite com o cadastro.
4. O formulário continua sem autoridade para escolher `role`; somente a validação
   server-side pode atribuir `ALUNO`.
5. Token explícito inválido ou indisponível aborta a criação da conta; a ausência
   do header permite `PERSONAL` somente quando não há intenção explícita de convite.

Após verificação e login nativo, o app aceita o convite pelo BFF mobile, recarrega
`/me` e só navega quando os IDs canônicos coincidem com o resultado do aceite.

O header existe apenas no request de criação da conta e não representa sessão ou
autorização permanente. O token nunca é gravado como identidade do usuário.

## Proxy BFF

A rota `/api/backend/[...path]` executa quatro passos:

1. Valida o cookie BetterAuth com `auth.api.getSession`.
2. Obtem o JWT pelo header interno `set-auth-jwt`.
3. Reconstroi os headers enviados para a NodusAPI.
4. Encaminha corpo, metodo, query string e resposta.

Headers de identidade enviados pelo browser sao descartados. Em especial:

- `Authorization`
- `x-user-id`
- `x-user-role`
- `x-correlation-id`

O unico `Authorization` encaminhado e criado pelo BFF com o JWT emitido pelo
BetterAuth. A NodusAPI cria uma correlação nova para resposta, logs e auditoria;
um valor fornecido pelo cliente não é refletido.

## Aceite do convite

Depois que o cadastro do aluno termina:

1. O frontend chama `POST /api/registration-invites/accept`.
2. A requisição envia `{ token }`; o BFF exige o formato opaco limitado antes de
   construir a rota upstream.
3. O BFF valida a sessao e obtem um JWT curto.
4. Chama `POST /api/v1/invites/{token}/accept` na NodusAPI.
5. A API compara role e e-mail do JWT com usuario e convite persistidos.
6. A API bloqueia a linha do convite com `FOR UPDATE`.
7. Cria `student_profiles` e marca o convite como `USED` na mesma transacao.

O lock e a transacao impedem que duas requisicoes aceitem o mesmo convite ao
mesmo tempo.

Links recebidos como `/cadastro?token=...` usam `/cadastro` como alias para a tela
de acesso de aluno; o token é preservado para validação, cadastro ou login e aceite.

## Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/auth.ts` | Configuracao BetterAuth, tabelas, Google, role e JWT |
| `src/app/api/auth/[...all]/route.ts` | Endpoints oficiais BetterAuth |
| `src/app/cadastro/page.tsx` | Alias dos links de convite para o acesso de aluno |
| `src/app/api/backend/[...path]/route.ts` | Ponte autenticada para NodusAPI |
| `src/lib/bff/headers.ts` | Lista permitida e reconstrucao de headers |
| `src/app/api/registration-invites/prepare/route.ts` | Pré-valida convite sem persistir estado no cliente |
| `src/app/api/registration-invites/accept/route.ts` | Consome convite apos autenticar |
| `src/lib/contracts/nodus-api.ts` | Contratos tipados usados pelo frontend |

## Login Google pelo app Expo

O app usa `@better-auth/expo/client` e `expo-web-browser` para abrir o fluxo
BetterAuth no navegador e retornar por deep link. O cliente envia
`signIn.social({ provider: "google", callbackURL: "/", requestSignUp: false })`;
o Expo plugin converte o callback relativo em `Linking.createURL`. Sessão/cookie
fica no SecureStore do app. O app consulta `/api/mobile/backend/me` com esse
cookie; só o BFF cria o JWT de domínio para NodusAPI.

Esse botão é login, não signup Google mobile. O Google provider do BetterAuth já
desabilita cadastro implícito; convites de novos alunos continuam pelo cadastro
explícito de e-mail. Conta e role canônicas, elegibilidade, vínculo e perfil são
decididos pelo BetterAuth/NodusAPI, não pelo perfil enviado pelo Google.

`GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` são variáveis server-only do Next/BFF,
nunca Expo `EXPO_PUBLIC_*`. Google Cloud deve autorizar
`<BETTER_AUTH_URL>/api/auth/callback/google`. `nodusfit://` é o retorno de um build
instalado; `exp://` e loopback só entram em `trustedOrigins` durante
`NODE_ENV=development`. Para o Expo Go contra Preview, a variável server-only
`NODUS_PREVIEW_EXPO_GO_ORIGIN` libera uma origem exata somente quando
`VERCEL_ENV=preview` e `VERCEL_GIT_COMMIT_REF` aponta para a branch de staging; o
parser rejeita wildcard, query e path. Production continua sem `exp://`.

### Acesso ao Preview pelo dispositivo

No retrato do projeto Vercel em 13/10/2026, Vercel Authentication/SSO está
habilitado para deployments que não sejam custom domains, e não há domínio
customizado de staging listado. O app Expo não herda a sessão de SSO do navegador;
assim, a proteção pode bloquear `/api/auth/*` e `/api/mobile/backend/*` antes do
BetterAuth/BFF. O bypass de automação é segredo servidor e não pode ir no bundle
mobile. O teste de dispositivo requer um hostname de staging acessível publicamente
(por exceção de proteção restrita a esse hostname ou projeto isolado). Os demais
deployments devem continuar protegidos. A configuração atual de proteção não foi
alterada globalmente; somente o hostname citado abaixo tem exceção.

O alias da implantação mais recente da branch, SHA
`bd98c552129579fecb98f097f01321f4993793d2`, é
`nodusfit-git-codex-final-pr-3f6c16-jeferson-mesquitas-projects.vercel.app`.
Foi escolhida uma exceção só para esse hostname; a Vercel avisa que deploys atuais
e futuros nele ficarão públicos até remover a exceção. Após confirmação explícita,
a exceção foi aplicada e o hostname aparece em **Unprotected Domains**. A rota
`/acesso` abriu publicamente no navegador interno. SSO global e outros Previews
seguem protegidos. Na UI Preview também foram encontrados os nomes
`GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` para a branch, sem revelar valores nem
validar se são válidos.

O Preview com a validação de origem foi marcado `READY` pela Vercel no commit
`30c1c9587ccb9cf89728fb0c98a3a907db7590ed`. A variável não secreta
`NODUS_PREVIEW_EXPO_GO_ORIGIN` está configurada como Preview, branch
`codex/final-pr-preview-2026-09-28`; nenhum valor Google, segredo ou env de
Production foi alterado.

Com Origin `exp://` exato, `POST /api/auth/sign-in/social` respondeu `200` com
redirect para `accounts.google.com`, sem seguir o redirect nem enviar dados de
conta. `GET /api/auth/token` respondeu `404`. Isso confirma a fronteira e o início
do provider, mas não conclui callback, consentimento, sessão Expo ou `/me`.

## Configuracao necessaria

Consulte `.env.example`. Em producao:

- `DATABASE_URL` deve ser server-only.
- `BETTER_AUTH_SECRET` deve ter alta entropia.
- `BETTER_AUTH_URL` deve ser a URL publica exata do frontend.
- `NODUS_API_URL` deve apontar para a API C#.
- As credenciais Google devem usar o callback BetterAuth do ambiente.

## APK mobile de demonstração no Preview — 15/10/2026

O bundle do APK aponta `EXPO_PUBLIC_AUTH_BASE_URL` e `EXPO_PUBLIC_MOBILE_BFF_URL` ao hostname público de staging; mobile envia o cookie BetterAuth ao BFF. Ele não deve chamar a API Render diretamente nem receber seu JWT. A configuração de servidor `NODUS_API_URL` deve seguir apontando à NodusAPI de staging.

Reachability verificada: Preview atual da branch está `READY`; sem sessão, `GET /api/auth/get-session` respondeu 200 e `GET /api/mobile/backend/me` respondeu 401. A API staging respondeu 200 em `/health`. Esses resultados não comprovam uma chamada autenticada do BFF à API. Nesta checagem, a listagem das envs Vercel retornou 403, então o valor ativo de `NODUS_API_URL` não foi relido; não afirmar integração autenticada como validada até executar login e `/me` no aparelho.

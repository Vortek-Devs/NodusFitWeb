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

## Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/auth.ts` | Configuracao BetterAuth, tabelas, Google, role e JWT |
| `src/app/api/auth/[...all]/route.ts` | Endpoints oficiais BetterAuth |
| `src/app/api/backend/[...path]/route.ts` | Ponte autenticada para NodusAPI |
| `src/lib/bff/headers.ts` | Lista permitida e reconstrucao de headers |
| `src/app/api/registration-invites/prepare/route.ts` | Pré-valida convite sem persistir estado no cliente |
| `src/app/api/registration-invites/accept/route.ts` | Consome convite apos autenticar |
| `src/lib/contracts/nodus-api.ts` | Contratos tipados usados pelo frontend |

## Configuracao necessaria

Consulte `.env.example`. Em producao:

- `DATABASE_URL` deve ser server-only.
- `BETTER_AUTH_SECRET` deve ter alta entropia.
- `BETTER_AUTH_URL` deve ser a URL publica exata do frontend.
- `NODUS_API_URL` deve apontar para a API C#.
- As credenciais Google devem usar o callback BetterAuth do ambiente.

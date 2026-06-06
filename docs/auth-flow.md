# Fluxo de autenticacao BetterAuth e NodusAPI

Este documento explica como as partes se conectam e onde cada responsabilidade
fica. A implementacao correspondente esta dividida entre este repositorio e o
PR backend [NodusAPI #1](https://github.com/Vortek-Devs/NodusAPI/pull/1).

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

## Login por e-mail ou Google

1. O browser chama uma rota em `/api/auth/*`.
2. BetterAuth executa login, cadastro ou callback Google.
3. BetterAuth cria ou recupera `users`, `accounts` e `sessions`.
4. O browser recebe apenas o cookie de sessao.
5. Ao chamar uma funcionalidade de dominio, o browser usa `/api/backend/*`.
6. O BFF valida a sessao, obtem o JWT e chama a NodusAPI.

O Google OAuth usa o `state` normal do provedor. O convite nao e serializado
dentro dele.

## Definicao da role

A role nao e aceita em formulario nem em JSON de cadastro.

- Cadastro aberto sem convite valido: `PERSONAL`.
- Cadastro com convite valido e e-mail correspondente: `ALUNO`.

Essa decisao acontece no hook server-side `user.create.before`. Mesmo que o
browser envie `role: "ADMIN"` ou `role: "ALUNO"`, o campo BetterAuth possui
`input: false` e o valor enviado e ignorado.

## Convite com Google OAuth

1. A tela recebe o token puro pela URL.
2. O frontend chama `POST /api/registration-invites/oauth-cookie`.
3. O BFF valida o token na rota publica da NodusAPI.
4. Sendo valido, grava um cookie `httpOnly`, `SameSite=Lax`, com dez minutos.
5. O usuario inicia login ou cadastro Google.
6. No callback, o hook BetterAuth le o cookie no servidor.
7. O hook consulta novamente o convite e compara o e-mail.
8. Somente convite `ALUNO` com e-mail igual produz role `ALUNO`.

O cookie e curto porque serve apenas para atravessar o redirecionamento OAuth.
Ele nao representa sessao, autorizacao permanente ou vinculo com um personal.

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

O unico `Authorization` encaminhado e criado pelo BFF com o JWT emitido pelo
BetterAuth.

## Aceite do convite

Depois que o cadastro do aluno termina:

1. O frontend chama `POST /api/registration-invites/accept`.
2. O BFF recupera o token do cookie `httpOnly`.
3. Valida a sessao e obtem um JWT curto.
4. Chama `POST /api/v1/invites/{token}/accept` na NodusAPI.
5. A API compara role e e-mail do JWT com usuario e convite persistidos.
6. A API bloqueia a linha do convite com `FOR UPDATE`.
7. Cria `student_profiles` e marca o convite como `USED` na mesma transacao.
8. O BFF remove o cookie de convite quando a operacao termina com sucesso.

O lock e a transacao impedem que duas requisicoes aceitem o mesmo convite ao
mesmo tempo.

## Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/auth.ts` | Configuracao BetterAuth, tabelas, Google, role e JWT |
| `src/app/api/auth/[...all]/route.ts` | Endpoints oficiais BetterAuth |
| `src/app/api/backend/[...path]/route.ts` | Ponte autenticada para NodusAPI |
| `src/lib/bff/headers.ts` | Lista permitida e reconstrucao de headers |
| `src/app/api/registration-invites/oauth-cookie/route.ts` | Preserva convite durante OAuth |
| `src/app/api/registration-invites/accept/route.ts` | Consome convite apos autenticar |
| `src/lib/contracts/nodus-api.ts` | Contratos tipados usados pelo frontend |

## Configuracao necessaria

Consulte `.env.example`. Em producao:

- `DATABASE_URL` deve ser server-only.
- `BETTER_AUTH_SECRET` deve ter alta entropia.
- `BETTER_AUTH_URL` deve ser a URL publica exata do frontend.
- `NODUS_API_URL` deve apontar para a API C#.
- As credenciais Google devem usar o callback BetterAuth do ambiente.

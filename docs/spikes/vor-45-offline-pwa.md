# VOR-45 - Spike offline PWA

## Escopo validado

Este spike adiciona uma prova controlada em `/aluno/treino` para validar o
comportamento offline antes da tela real de treino do aluno. A rota usa dados
mockados, cache via service worker, timer client-side e fila local em IndexedDB.

## Decisao tecnica

- O Next 16 ja cobre `manifest.ts`, mas nao entrega cache offline por padrao.
- A documentacao local do Next recomenda `public/sw.js` para service workers e
  cita Serwist como opcao para offline, com a ressalva de configuracao webpack.
- `next-pwa` nao esta instalado no repo e nao foi adotado neste spike para evitar
  acoplar a base do MVP a um plugin antes de validar o comportamento minimo.
- A implementacao atual usa service worker manual para cachear `/aluno/treino` e
  assets de `/_next/static/`.

## Resultado por hipotese

| Hipotese | Resultado |
| --- | --- |
| Cache da tela de treino | Validado para a rota mockada apos primeiro acesso online. |
| Registro de series offline | Validado com fila em IndexedDB. |
| Sync ao reconectar | Validado contra endpoint mockado `POST /api/offline-spike/series`. |
| Timer offline | Validado no client, independente de rede. |
| Limite de cache mobile | A pagina expõe `navigator.storage.estimate()`, mas iOS Safari precisa de teste manual em device real. |

## UX recomendada para offline

- Mostrar status Online/Offline no topo da tela de treino.
- Permitir registrar serie sem bloquear o aluno.
- Mostrar fila pendente com botao de sincronizacao manual.
- Ao reconectar, tentar sync automatico e manter o registro na fila se a API falhar.
- Para plano de treino atualizado pelo personal, preferir mostrar "versao cacheada"
  com indicacao visual quando a versao local estiver desatualizada.

## Limitacoes conhecidas

- Chat, historico completo, notificacoes e dados financeiros nao devem prometer
  funcionamento offline nesta fase.
- Background Sync nativo ainda precisa ser testado por navegador; a alternativa
  segura para o MVP e sincronizar no evento `online` e ao abrir a tela.
- O endpoint do spike nao persiste dados. A implementacao real deve validar auth,
  ownership do aluno e idempotencia por `series.id`.
- iOS Safari deve ser validado em aparelho real instalado na tela inicial antes de
  assumir o comportamento de cache como final.

## Proximos passos

1. Testar `/aluno/treino` em Chrome com DevTools offline.
2. Testar no iOS Safari instalado na tela inicial.
3. Definir contrato real de sync com idempotencia.
4. Decidir entre service worker manual, Serwist ou plugin PWA antes de VOR-21.

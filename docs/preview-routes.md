# Preview Routes

Este documento mapeia as rotas abertas de preview criadas enquanto auth, backend e dados reais ainda estao em evolucao.

## Fluxo Interno do Personal

Estas rotas compartilham o `PersonalPreviewShell`, baseado no aside do dashboard. O objetivo e manter uma navegacao minima real entre as telas que ja se conversam.

| Rota | Tela | Estado | Fonte visual |
| --- | --- | --- | --- |
| `/dashboard` | Dashboard do personal | carregado | `nodus_fit_dashboard_personal.html` |
| `/treinos/novo` | Cadastro/builder de treino | carregado | `Personal_workout_builder.html` |
| `/financeiro` | Controle financeiro | carregado | `financeiro.html` |
| `/financeiro/carregando` | Controle financeiro | loading state | `financeiro.html` |
| `/financeiro/vazio` | Controle financeiro | empty state | `financeiro.html` |
| `/financeiro/drawer` | Controle financeiro | drawer de historico aberto | `financeiro.html` |
| `/financeiro/pagamento` | Controle financeiro | modal de registrar pagamento | `financeiro.html` |
| `/financeiro/config` | Controle financeiro | modal de configuracao | `financeiro.html` |

Notas:

- `/financeiro` foi componentizada em React/Next; nao usa iframe.
- No fluxo normal de `/financeiro`, os botoes de historico, registrar pagamento e configurar mensalidade abrem drawer/modal na propria tela. As rotas `/financeiro/drawer`, `/financeiro/pagamento` e `/financeiro/config` sao deep links de preview para validar cada estado diretamente.
- O drawer financeiro abre como gaveta lateral vindo da direita; modais continuam centralizados.
- `/dashboard` foi componentizada em React/Next e compartilha o mesmo frame centralizado do financeiro.
- `/treinos/novo` ainda usa o HTML de referencia via iframe, mas fica dentro do shell global para validar navegacao e fluxo.
- O shell global e a fonte de verdade para navegacao interna do personal nesta fase.
- Em mobile, o shell exibe bottom nav resumida e um item `Menu` que abre a navegacao completa do aside como gaveta lateral.
- As telas permanecem abertas para preview e fora do fluxo de auth/login.

## Fluxo do Aluno

Estas rotas representam o app do aluno, com mock data e sem dependencia de backend.

| Rota | Tela | Estado |
| --- | --- | --- |
| `/aluno/treino` | Home do aluno | treino do dia |
| `/aluno/treino/executando` | Execucao de treino | serie ativa |
| `/aluno/treino/descanso` | Execucao de treino | descanso/timer |
| `/aluno/treino/resumo` | Execucao de treino | resumo pos-treino |
| `/aluno/perfil` | Perfil do aluno | dados e progresso |
| `/aluno/evolucao` | Evolucao do aluno | metricas, grafico e historico |
| `/aluno/chat` | Chat aluno-personal | conversa mockada |
| `/aluno/bem-vindo` | Onboarding do aluno | boas-vindas |

Notas:

- As rotas do aluno usam um shell proprio mobile-first, porque representam o PWA/app do aluno.
- Em tablet/desktop, o shell do aluno se adapta como painel responsivo, sem moldura fixa de celular.
- Essas telas nao devem importar dependencias de auth real enquanto o backend estiver pendente.

## Fluxos Publicos e Convite

| Rota | Tela | Estado |
| --- | --- | --- |
| `/t/demo-token` | Link publico de treino | preview publico compartilhavel |
| `/acesso/aluno-preview` | Cadastro via convite | preview visual sem integrar auth |

Notas:

- `/t/demo-token` simula o link publico `/t/:token`.
- `/acesso/aluno-preview` e apenas vitrine visual do convite/cadastro; nao substitui a rota real de auth.

## Mapeamento Linear

Principais issues tocadas pelo preview:

- Personal/dashboard/treino: `VOR-55`, `VOR-84`, `VOR-76`
- Financeiro: `VOR-95`, `VOR-96`, `VOR-97`, `VOR-32`, `VOR-10`
- Aluno treino: `VOR-87`, `VOR-88`, `VOR-109`, `VOR-90`, `VOR-89`, `VOR-91`
- Aluno perfil/evolucao/chat: `VOR-110`, `VOR-92`, `VOR-93`, `VOR-94`, `VOR-103`, `VOR-29`, `VOR-9`
- Publico/convite/onboarding: `VOR-105`, `VOR-111`, `VOR-54`, `VOR-71`, `VOR-72`

## Regras de Implementacao

- Nao usar iframe para novas telas componentizadas.
- Quebrar prototipos HTML em componentes e estados reais quando a tela entrar no fluxo.
- Manter rotas de preview abertas, com `robots.index = false`.
- Nao alterar auth/login ate o backend estar pronto.
- Mock data deve ficar centralizada no componente/feature da tela ate existir contrato de API.
- Quando uma tela pertencer ao produto interno do personal, usar `PersonalPreviewShell`.
- Quando uma tela pertencer ao app do aluno, usar o shell do aluno.

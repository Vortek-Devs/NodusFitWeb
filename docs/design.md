# Nodus Fit — guia visual e de produto para IA

Este documento acompanha referências visuais quando outra IA for criar motion graphics, vídeo ou imagens para o Nodus Fit. Use junto com capturas atuais do produto e `docs/motion-graphics-brief.md`.

## Fonte de verdade

- Tokens e regras gerais: `docs/design-system.md`.
- Cores e tipografia do Web: `src/app/globals.css` e `src/app/layout.tsx`.
- Tokens nativos do Expo: `NodusFitApp/src/theme/tokens.ts`.
- Logo oficial: `public/brand/nodus-fit-logo.png` — cópia íntegra do original 500 × 500 em PNG RGBA, com o mesmo SHA-256 de `NodusFitApp/assets/nodus-fit-logo.png`. Não redesenhar, substituir, recolorir ou achatar sobre fundo que elimine o contraste.
- As referências de landing que estão fora do repositório são históricas; não são fonte de métricas, preços ou capacidades atuais.

## Identidade

| Uso | Token / valor | Fonte |
| --- | --- | --- |
| Mint principal | `#3DD9A4` | `--brand-400` |
| Fundo escuro | `#0A0F0D` | `--color-bg-page` em `.dark` |
| Superfície escura | `#111D1A` | `--color-bg-surface` em `.dark` |
| Borda escura | `#1E3D35` | `--color-border` em `.dark` |
| Texto claro | `#E8FBF5` | `--color-text-primary` em `.dark` |
| Texto secundário escuro | `#96CCBC` | `--color-text-secondary` em `.dark` |
| Fundo claro | `#F0FBF8` | `--color-bg-page` |
| Tinta principal clara | `#0D2D38` | `--color-text-primary` |
| Títulos | Syne | `src/app/layout.tsx` |
| Texto | Manrope | `src/app/layout.tsx` |
| Rótulos técnicos | Geist Mono | `src/app/layout.tsx` |

Direção: operação de treino, precisa e humana. Usar contraste entre pinho escuro e mint, títulos expressivos, cartões organizados e linhas que conectem as etapas do fluxo. Movimento deve esclarecer a relação entre telas; não decorar por decorar. Manter leitura, safe areas e legendas. Evitar neon roxo, hologramas, partículas genéricas e interfaces flutuantes sem relação com o produto.

Não forçar todas as telas para o mesmo tema: a LP/Web atual é escura; telas internas do Expo usam os tokens reais de cada fluxo (por exemplo, autenticação escura e telas de treino claras). Mostrar cada plataforma como ela existe.

## O que o produto atual permite mostrar

Fluxo Web implementado no preview atual:

1. Personal acessa ou cria conta em `/acesso?perfil=personal`.
2. Mantém alunos e vínculos em `/alunos`.
3. Pesquisa ou cadastra exercícios em `/exercicios`.
4. Cria e publica um modelo em `/treinos/novo?tipo=modelo`, com séries, faixa de repetições, carga sugerida, descanso e orientações.
5. Monta um plano semanal em `/treinos/novo?tipo=plano` usando modelos publicados.
6. Atribui uma versão publicada a um aluno ativo.
7. No Expo, o aluno consulta as atribuições e o plano do dia em `NodusFitApp/app/(aluno)/index.tsx`.

Versões publicadas são imutáveis; uma alteração vira outro rascunho/versão. A atribuição preserva a versão recebida.

## Telas e componentes de referência

| Parte | Captura atual a anexar ao prompt | Fonte do Web | Fonte do Expo |
| --- | --- | --- | --- |
| Acesso do personal | `/acesso?perfil=personal` | `src/app/acesso/page.tsx`, `src/components/auth/access-auth-client.tsx` | `NodusFitApp/app/(auth)/sign-in.tsx` |
| Carteira de alunos | `/alunos` | `src/app/(app)/alunos/page.tsx`, `src/components/students/students-roster-client.tsx` | — |
| Biblioteca de exercícios | `/exercicios` | `src/app/(app)/exercicios/page.tsx`, `src/components/exercises/exercises-catalog-client.tsx` | — |
| Editor de modelo | `/treinos/novo?tipo=modelo` | `src/app/(app)/treinos/novo/page.tsx`, `src/components/training/training-content-editor-client.tsx` | — |
| Editor de plano semanal | `/treinos/novo?tipo=plano` | `src/app/(app)/treinos/novo/page.tsx`, `src/components/training/training-content-editor-client.tsx` | `NodusFitApp/app/(personal)/workouts.tsx` lista modelos/planos pela API |
| Treino atribuído ao aluno | uma atribuição ativa, sem nomes/e-mails visíveis | fluxo de atribuição no editor de planos | `NodusFitApp/app/(aluno)/index.tsx` consome atribuições da API |

No repositório móvel `NodusFitApp`, `app/(personal)/workouts.tsx` e `app/(aluno)/index.tsx` são fontes atuais para modelos/planos e treino atribuído. Não usar como prova as telas demonstrativas em `app/(personal)/index.tsx`, `app/(personal)/students.tsx`, `app/(aluno)/history.tsx` e `app/(aluno)/progress.tsx`.

Capturar telas diretamente do preview atualizado. Esconder navegador, DevTools, nomes, e-mails, IDs, tokens e qualquer dado pessoal. Preferir uma tela com dados de teste sanitizados; não compor métricas ou exemplos fictícios como se fossem produção. As capturas visuais ainda precisam ser anexadas separadamente ao prompt da IA.

## Limites de conteúdo

- Não inventar usuários, depoimentos, clientes, preços, contagens, percentuais, tempos de montagem ou resultados.
- Não anunciar analytics de aderência, risco de cancelamento, financeiro, relatórios, chat, agenda ou notificações como disponíveis.
- Não prometer offline, push ou aplicativo nativo como recurso pronto.
- O Dashboard Web informa que não há dados analíticos disponíveis. O menu marca financeiro, relatórios, mensagens e agenda como planejados.
- No Expo, não usar como prova as telas com dados demonstrativos: `NodusFitApp/app/(personal)/index.tsx`, `NodusFitApp/app/(personal)/students.tsx`, `NodusFitApp/app/(aluno)/history.tsx` e `NodusFitApp/app/(aluno)/progress.tsx`.
- Se uma cena precisar de conteúdo ilustrativo, identificá-lo visualmente como “exemplo” e não incluir números, pessoas ou métricas.

## Direção para a IA

Usar a logo original e as capturas anexadas como referências visuais prioritárias. Recriar somente o movimento entre etapas: aluno → catálogo → modelo → plano semanal → aluno no Expo. Não inventar telas, dados, labels nem comportamento que não apareçam nas fontes.

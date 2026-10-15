# Motion graphics — Nodus Fit

Brief para gerar um vídeo curto do produto e incorporá-lo à landing page. Este documento complementa [`design.md`](./design.md); não substitui capturas reais das telas.

## Entrega-alvo

- Uso principal: vídeo incorporado à LP Web.
- Duração: 15 segundos.
- Composição: 16:9, 1920 × 1080, 30 fps.
- Arquivo final sugerido: H.264 MP4; poster em WebP.
- Texto em PT-BR, legível sem áudio. Voz é opcional; não usar autoplay com áudio.
- Se houver corte vertical para redes sociais, compor uma versão própria 9:16; não cortar o master horizontal no automático.

## Ideia central

**Do seu catálogo à semana do aluno.** Mostrar a cadeia real entre organizar alunos, escolher exercícios, montar um modelo, distribuir a semana e apresentar o plano recebido no Expo.

## Storyboard

| Tempo | Tela-fonte | Ação visual | Texto na tela |
| --- | --- | --- | --- |
| 0–2s | Logo `public/brand/nodus-fit-logo.png` | Marca entra por traço mint; fundo pinho; título aparece em duas batidas | Do seu catálogo à semana do aluno. |
| 2–4.5s | Web `/alunos` e `/exercicios` | Linha conecta carteira e catálogo; usar capturas reais, dados pessoais ocultos | Alunos e exercícios, organizados. |
| 4.5–8s | Web `/treinos/novo?tipo=modelo` | Foco nos campos reais da prescrição; mover o destaque por séries, repetições, carga e descanso | Prescreva com seu método. |
| 8–11s | Web `/treinos/novo?tipo=plano` | Modelos publicados entram nos dias da semana; transição indica nova versão sem sobrescrever a anterior | Organize a semana. Preserve cada versão. |
| 11–13s | Expo `app/(aluno)/index.tsx` | Mostrar o plano atribuído chegando à tela “Treino de hoje”; ocultar nome e dados da conta de teste | O aluno consulta o plano recebido. |
| 13–15s | Logo original + LP | Fecho limpo; CTA aparece com espaço para leitura | Organize meu próximo treino. |

## Direção de motion

- Usar uma única linha/rota mint como fio condutor entre as etapas. Traços, máscaras e mudança de foco podem conduzir o olhar; evitar partículas aleatórias, hologramas, mockups de celulares flutuantes e brilho roxo genérico.
- O post de referência enviado serve apenas para ritmo/duração. Não reproduzir seu layout, paleta, tipografia, marca, copy ou UI de terceiro.
- Manter a UI real como referência. Capturas entram como camadas; animar enquadramento e realce, não pedir ao gerador que redesenhe texto pequeno da interface.
- Preservar a logo original. Não gerar outra versão do símbolo nem reconstruir o lettering.
- Uma ideia por cena; no máximo duas linhas curtas por cartela. Usar Manrope para apoio e Syne para títulos quando o editor permitir.
- Ritmo firme, sem cortes que impeçam ler os nomes dos campos. Transições suaves e intencionais; sem números de performance como elemento decorativo.

## Referências a anexar ao gerador

1. `docs/design.md` e `docs/design-system.md`.
2. `public/brand/nodus-fit-logo.png`.
3. Capturas atuais e sanitizadas de carteira de alunos, catálogo de exercícios, editor de modelo, editor do plano semanal e tela do aluno com atribuição.
4. Opcional: gravação curta do fluxo real para orientar transições; não usar protótipos antigos como prova de funcionalidade.

As capturas **ainda precisam ser salvas e anexadas**. Capturar do preview atualizado; remover navegador/DevTools, e-mails, nomes e identificadores de demonstração. Não usar telas com dados mockados como evidência de métricas.

## Guardrails factuais

- Não incluir contagem de usuários, adesão, tempo economizado, retenção ou qualquer percentual sem fonte aprovada.
- Não inventar depoimentos, nomes, preços, alertas, gráficos ou valores de exemplo.
- Não afirmar que financeiro, relatórios, mensagens, agenda, aderência em tempo real, push ou offline estão disponíveis. Esses itens não fazem parte do fluxo Web confirmado.
- Não usar os dashboards, históricos ou telas mobile que ainda exibem dados demonstrativos. A tela Expo do aluno em `app/(aluno)/index.tsx` e a lista de modelos/planos em `app/(personal)/workouts.tsx` consomem a API; o painel pessoal mobile e histórico/progresso do aluno contêm conteúdo demonstrativo.
- Se um gerador não conseguir manter uma captura fiel, substituir a cena por formas abstratas e rótulos verdadeiros; não fabricar uma tela de produto.

## Prompt-base

> Crie um vídeo de motion graphics de 15 segundos para a LP Nodus Fit, em PT-BR, 16:9 e 30 fps. Use a logo original e as capturas anexadas como fonte visual. Conte a sequência real: alunos → catálogo de exercícios → modelo de treino → plano semanal → tela do aluno com plano atribuído. Preserve a identidade pinho escuro e mint descrita em `docs/design.md`. Não invente usuários, métricas, depoimentos, preços, telas ou recursos. Use movimentos de linha e máscaras para guiar o olhar; mantenha rótulos curtos e legíveis. Termine com “Organize meu próximo treino.” e a marca original. Sem áudio automático; inclua legendas ou cartelas que funcionem sem som.

## Incorporação na LP

- Incluir poster; usar vídeo silencioso (`muted`, `playsInline`) ou iniciar apenas por ação do visitante.
- Disponibilizar controles, texto alternativo/transcrição e uma opção clara de reprodução.
- Com `prefers-reduced-motion`, mostrar o poster e exigir reprodução manual.
- Não carregar o vídeo pesado antes de estar próximo da viewport; manter CTA HTML visível mesmo se mídia falhar.

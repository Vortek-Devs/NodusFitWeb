# Nodus Fit Design System

Estes arquivos em `C:\Users\je_27\Downloads` guiam a base visual do projeto:

- `tailwind.config.ts`: fonte original dos tokens Tailwind v3.
- `tokens.css`: fonte original dos tokens CSS.
- `nodus-fit-spacing.html`: referencia de espacamento, radius, bordas, sombras e boas praticas.
- `nodus_fit_landing_page.html`: referencia de landing page e narrativa comercial.
- `Nodus Fit - Paleta de Cores v1.0`: referencia de paleta, contraste e contexto de uso.

Como este projeto usa Tailwind CSS v4, os tokens foram traduzidos para `src/app/globals.css` com `@theme inline`, em vez de depender de um `tailwind.config.ts`.

## Direcao visual

- Marca principal: `brand-400` / `#3DD9A4`.
- Fundo dark principal: `#0A0F0D`.
- Cards dark: `#111D1A` com borda `#1E3D35`.
- Fundo light: `#F0FBF8`, superficie `#FFFFFF`, borda `#C2F2E1`.
- Texto light principal: `#0D2D38`.
- Texto dark principal: `#E8FBF5`.

## Regras de interface

- Cards usam `rounded-lg` (`12px`) e `p-4` (`16px`) como padrao.
- Acoes primarias usam `bg-brand-400 text-on-brand shadow-brand`.
- Bottom navigation deve reservar `pb-safe-bottom`.
- Areas tocaveis nao devem ficar abaixo de `44px`.
- `shadow-brand-lg` deve ser usado em no maximo um elemento de destaque por tela.
- Status usam os tokens semanticos: `success`, `warning`, `danger`, `info`.

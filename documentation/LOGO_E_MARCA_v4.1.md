# LOGO_E_MARCA_v4.1.md

## Atualização da Identidade Visual: Logo e Nome da Marca

### Versão: 4.1
### Data: 05/07/2024

---

## 1. Visão Geral

Esta atualização representa uma mudança significativa na identidade visual do projeto. O logo antigo e o nome "Minera" foram substituídos para refletir uma marca mais moderna e profissional: **AdHawk**.

## 2. Detalhes da Implementação

### 2.1. Novo Componente de Logo (`Logo.tsx`)

- **Criação do Componente:** Um novo componente reutilizável, `Logo.tsx`, foi criado em `src/components/`.
- **Código SVG Inline:** O novo logo foi implementado como um SVG inline diretamente no componente. Isso evita a necessidade de carregar arquivos externos e permite estilização dinâmica.
- **Design do Logo:**
    - **Ícone:** Um ícone de gráfico ascendente dentro de um quadrado com cantos arredondados e um gradiente de azul.
    - **Fonte:** Utiliza a fonte 'Lexend' (ExtraBold) importada do Google Fonts, para um visual moderno.
    - **Texto:** "AdHawk".

### 2.2. Substituição do Logo Antigo

O novo componente `<Logo />` foi implementado nos seguintes locais, substituindo a identidade visual antiga:

- **✅ `Sidebar.tsx`:** O logo no topo da barra lateral foi substituído. O tamanho foi ajustado para se adequar ao layout.
- **✅ `LandingPage.tsx`:** O logo no cabeçalho da landing page foi atualizado.
- **✅ `Auth.tsx`:** A página de login/registro agora exibe o novo logo de forma proeminente no topo do formulário.
- **✅ `index.html` (Favicon):** O favicon do site foi atualizado para uma versão simplificada do novo logo, garantindo consistência da marca na aba do navegador.

### 2.3. Alterações no Código

- **Adicionado:**
    - `minera-dashboard/src/components/Logo.tsx`
- **Modificado:**
    - `minera-dashboard/src/components/Sidebar.tsx`: Importou e utilizou o componente `Logo`.
        - 🔄 **Original:** Bloco `div` com ícone `TrendingUp` e texto "AdHawk".
        - 🆕 **Novo:** Componente `<Logo className="w-40 h-auto" />`.
    - `minera-dashboard/src/components/LandingPage.tsx`: Substituiu o logo no header.
        - 🔄 **Original:** Bloco `div` com ícone `TrendingUp` e texto "Minera".
        - 🆕 **Novo:** Componente `<Logo className="w-48 h-auto" />`.
    - `minera-dashboard/src/components/Auth.tsx`: Atualizou o cabeçalho do formulário de autenticação.
        - 🔄 **Original:** Ícone `TrendingUp` e texto de boas-vindas.
        - 🆕 **Novo:** Componente `<Logo className="w-64 h-auto inline-block" />`.
    - `minera-dashboard/index.html`: Alterou o título da página e o favicon.
        - 🔄 **Original:** Título "Vite + React + TS" e favicon do Vite.
        - 🆕 **Novo:** Título "AdHawk" e favicon com o novo logo SVG.

## 3. Próximos Passos (Pendente de Confirmação)

- **Substituição de "Minera" por "AdHawk":** Foi identificada a necessidade de substituir todas as ocorrências textuais de "Minera" por "AdHawk" para garantir a consistência total da marca. Esta ação será executada após a aprovação do usuário. 
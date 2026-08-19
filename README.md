# EventTix — Plataforma de Eventos e Ingressos

Front-end de uma plataforma de eventos e ingressos (Next.js 16 + TypeScript + Tailwind CSS v4),
com dados simulados em memória (sem backend real e sem persistência entre reloads).

## Rodando o projeto

Este projeto requer **Node.js 20 ou superior** (o `package.json` já reflete isso). Se estiver
usando `nvm`, rode `nvm use` na raiz do projeto (há um `.nvmrc` pinado em `20.12.0`).

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

## Configuração

O front-end consome a API real em `/Users/nrafaels/verzel/backend/challengebackend`
(Spring WebFlux). Configure a URL base da API copiando o exemplo:

```bash
cp .env.example .env.local
```

Por padrão `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`, então rode o
backend localmente nessa porta antes de usar o front-end.

**Dependência externa pendente:** o backend ainda não tem CORS configurado.
Chamadas do navegador a partir da origem do front-end serão bloqueadas até que
uma `CorsConfigurationSource` liberando essa origem seja adicionada no backend.

## Testes

```bash
npm test
```

## Build de produção

```bash
npm run build
npm start
```

(O script `build` usa `next build --webpack` em vez do Turbopack padrão — nesta configuração
específica, o Turbopack falha ao empacotar o binário nativo do `@tailwindcss/oxide` durante a
geração de páginas estáticas; `next dev` com Turbopack funciona normalmente.)

## Contas de teste

Contas semeadas no banco do backend (senha `senha123` para todas):

| Email | Papel |
|---|---|
| cliente@verzel.com | Cliente — compra ingressos, acessa "Meus ingressos" |
| organizador@verzel.com | Organizador — cria/edita/exclui eventos |
| portaria@verzel.com | Portaria — valida ingressos na entrada |

## Funcionalidades

- Busca e filtro de eventos por título, categoria, local, data e faixa de preço.
- Gestão de eventos pelo organizador (criar, editar, excluir).
- Reserva por mapa de assentos (cinema/teatro) ou por quantidade (pista).
- Pagamento simulado com aprovação ou recusa explícitas, incluindo fluxo de "tentar novamente".
- "Meus ingressos" com QR code por ingresso.
- Portaria: leitura de QR pela câmera (via `html5-qrcode`, com suporte a leitores de
  código de barras via Enter) ou digitação manual, com retorno de válido / inválido /
  já utilizado / evento errado.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand, `qrcode.react`,
`html5-qrcode`, Vitest + React Testing Library.

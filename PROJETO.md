# EventTix — Sobre o projeto


Para instruções de instalação, veja [`README.md`](README.md).


## Comentarios sobre o processo de desenvolvimento
 Optei pelo NextJs pelas ferramentas que ele ja dispoe nativamente alem de facilitar o processo de deploy,
 Inicialmente acabei me empolgando quando comecei a  criar o font end por isso acabei fugindo um pouco gitflow padrao, mas nas features seguintes ja corrigi esse problema, aqui no frontend eu começo sempre fazendo todo o fluxo com dados mockados deixando pre configurado aguardando somente a finalizacao da api para que eu possa integrar sem mais problemas, assim como no backend eu  cubro todas as funcionalidades por testes para garantir mais confiabilidade e segurança durante o processo. 
 E assim como no backend a maior partes das funcionalidades que eu desenvolvi aqui ja tinha feito anteriormente em outras experiencias entao nao foi muito complicado montar e escrever o fluxo.
 A minha maior dificuldade durante o desenvolvimento do front end foi encontrar uma identidade visual que me agradasse e nao ficasse uma copia barata de qualquer outra ja existente, acabei encontrando a Boutique Theater, durante algumas pesquisas e reoslvi adotar ela, eu particularmente prefiro temas mais escuros entao a escolha casou bem.
 Referente ao fluxo  tentei deixar o mais simples e direto possivel respeitando os requisitos. Na parte de finalizacao de pagamento optei por 2 botoes, um de aprovar e outro de reprovar ao inves de um fluxo mais completo  pois nao achei necessario ja que o  que mudaria seriam mais um formulario e no final o botao de pagamento iria disparar a  chamada para api, e com base no cartao inserido iria aprovar ou nao,  entao nesse caso especifico resolvi simplificar essa etapa. mas em um caso real seria isso que seria implementado.

 Da mesma forma que fiz no backend acabei usando a IA,mas nao como um vibe coder, que simplesmente  joga um comando pede pra ia nao errar e nao alucinar e aguarda o resultado, eu planejei, dividi os requisitos em pequenas tasks e apos montar todo o fluxo, decisões, etc, tudo que foi implementado ja havia sido previamente decidido, desde a paleta de cores a estrutura da aplicação, a IA so me poupou o tempo de nao ter que copiar/ colar e digitar tudo na mao.

  No mais pedi tambem para que a IA detalhasse melhor tudo que eu fiz ao longo desse processo.

## Funcionalidades

- **Busca e filtro de eventos** por título, categoria, local, período e faixa
  de preço, todos visíveis na tela (sem esconder atrás de um botão).
- **Gestão de eventos pelo organizador** — criar, editar e excluir, com dois
  modos de venda: mapa de assentos (fileiras × colunas) ou por quantidade
  (capacidade total).
- **Reserva** por seleção de assentos ou stepper de quantidade, com o preço
  total atualizado em tempo real.
- **Pagamento** via Stripe em modo de teste — dois botões explícitos
  ("simular aprovação"/"simular recusa") usando payment methods de teste do
  próprio Stripe, sem formulário de cartão.
- **"Meus ingressos"** com QR code por ingresso, e um link público de
  compartilhamento por ingresso.
- **Portaria** — leitura de QR pela câmera (`html5-qrcode`) ou digitação
  manual (também serve para leitores de código de barras físicos, que
  simulam digitação + Enter), com retorno de válido / inválido / já
  utilizado / evento errado / expirado.
- **Pôsteres de eventos de filme** sincronizados automaticamente do TMDB por
  um job do backend, exibidos com um badge indicando a origem.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand,
`qrcode.react`, `html5-qrcode`, Vitest + React Testing Library.

## Como o projeto evoluiu


### 1. Protótipo com dados em memória

A primeira versão não tinha backend real: os dados nasciam de um seed
carregado em uma store Zustand em memória (sem persistência entre reloads).
O objetivo era validar toda a lógica de negócio e os fluxos — inclusive
casos de borda como corrida por estoque e os quatro estados de validação de
ingresso na portaria — antes de existir uma API para integrar.

Toda mutação de dados sempre passou por *actions* da store, nunca por edição
direta do estado. Essa disciplina foi proposital: deixou o código pronto
para, na fase seguinte, trocar cada action por uma chamada de API real sem
precisar reescrever os componentes que a usam.

### 2. Integração com a API real

Com o backend (Spring WebFlux) disponível, a integração foi feita
incrementalmente, área por área — autenticação primeiro, depois eventos,
depois reserva/checkout, depois portaria e compartilhamento — sempre
mantendo a suíte de testes verde a cada passo. Ao final, a store de dados
local (`dataStore`) foi reduzida a um único campo de estado efêmero de UI
(a reserva pendente durante o checkout); tudo o mais — eventos, reservas,
ingressos, validação — vem do backend e sobrevive a um refresh de página.

A base URL da API fica centralizada em uma única variável de ambiente
(`NEXT_PUBLIC_API_BASE_URL`, lida em `src/lib/api/client.ts`), o que permitiu
apontar o deploy de produção (Vercel) para o backend publicado (Render) sem
tocar em nenhum outro ponto do código.

### 3. Redesign visual ("Boutique Theater")

O visual da primeira fase foi intencionalmente simples — o foco era lógica
de negócio, não estética. Esta fase final define e aplica um sistema visual
próprio.
A direção escolhida foi uma identidade
inspirada em bilheteria de teatro — escura, quente, elegante sem ser
corporativa:

- **Paleta escura única** (sem light mode, para não duplicar/manter duas
  paletas em paralelo), com vinho como cor de ação/erro, dourado para
  preço/categoria, e verde-oliva reservado só para confirmação positiva
  explícita — as cores nunca competem no mesmo elemento.
- **Tipografia com intenção**: Fraunces (serifada) para títulos, Work Sans
  para toda a UI funcional — em vez da tipografia padrão sem escolha.
  Carregadas via `next/font/google` (a estratégia recomendada pelo próprio
  Next.js), não por `<link>` de CDN externa.
- **Cantos quase retos e sem sombra decorativa** — separação visual só por
  borda e diferença de superfície.
- **Estados de carregamento/erro/sucesso** unificados: skeletons que
  espelham o formato do conteúdo real (em vez de "Carregando...") e um único
  componente de "caixa com contorno" reaproveitado para erro, sucesso e
  estado neutro (só muda cor/texto) — mantém a portaria simples mesmo tendo
  quatro resultados possíveis de validação.


## Outras decisões de projeto

- **Autenticação por papel (role) fixo**: cada conta tem um papel
  (`customer`/`organizer`/`gate`) definido no backend; rotas protegidas
  (`/organizer/*`, `/gate`, `/my-tickets*`) redirecionam para `/login` se o
  usuário atual não corresponde ao papel exigido (`RoleGuard`), e há um
  bloqueio explícito para impedir que a portaria acesse áreas de compra.
- **Leitura de QR com fallback sempre visível**: a câmera nunca é a única
  opção — o campo de digitação manual fica sempre disponível ao lado do
  scanner, tanto para QR ilegível quanto para leitores de código de barras
  físicos de portaria (que "digitam" o código seguido de Enter).
- **Sem E2E nesta fase**: a cobertura é unitária (lógica de negócio, ex.:
  os quatro estados de validação de ingresso) e de componente (React Testing
  Library, fluxos críticos como seleção de assento e checkout). Testes E2E
  ficaram de fora porque mockar acesso à câmera nesse tipo de teste tem um
  custo alto para o escopo do desafio.
- **Deploy**: front-end na Vercel (deploy automático a cada push em `main`),
  backend no Render. Variáveis `NEXT_PUBLIC_*` do Next.js são inlined em
  build time, então a troca de ambiente (local → produção) é só uma
  variável de ambiente, sem branch nem build especial.

## Estrutura de pastas (resumo)

```
src/
  app/            # rotas (App Router) — uma pasta por rota, page.tsx fino
                   # delegando para um *Content.tsx testável
  components/     # componentes de UI reutilizáveis
  lib/
    api/          # um arquivo por recurso do backend (events, reservations,
                   # auth, validation, sharing) — cada um traduz DTO <-> tipo
                   # de domínio do front-end
    stores/       # Zustand: authStore (usuário logado), dataStore (estado
                   # efêmero de UI)
    hooks/        # useAsync — padrão único para dado assíncrono + loading/erro
    utils/        # validação de formulário, helpers de evento, cor do pôster
```

## Testes

```bash
npm test
```

212 testes (Vitest + React Testing Library) cobrindo os adaptadores de API,
as stores, os componentes de UI e os fluxos críticos de cada tela.

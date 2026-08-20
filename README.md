# EventTix — Como rodar localmente

Guia passo a passo para rodar o front-end (Next.js) na sua máquina. Para uma
apresentação do projeto e das escolhas de desenvolvimento, veja [`PROJETO.md`](PROJETO.md).

## Pré-requisitos

- **Node.js 20 ou superior** — o projeto está pinado em `20.12.0` no `.nvmrc`.
  Se você usa `nvm`:

  ```bash
  nvm use
  ```

- **O backend rodando** (Spring WebFlux, repositório `challengebackend`). O
  front-end depende dele para **tudo** — login, listagem/CRUD de eventos,
  reservas, pagamento, "meus ingressos" e validação na portaria. Sem o
  backend no ar, praticamente nenhuma tela funciona além do layout.

## Passo a passo

### 1. Suba o backend primeiro

Em outro terminal, na raiz do repositório do backend (por exemplo,
`/Users/nrafaels/verzel/backend/challengebackend`), siga as instruções de
`README` daquele projeto para rodá-lo localmente. Por padrão ele sobe em
`http://localhost:8080` — confirme com:

```bash
curl http://localhost:8080/actuator/health
```

### 2. Instale as dependências do front-end

Na raiz deste projeto (`verzel_challenge/`):

```bash
npm install
```

### 3. Configure a URL da API

```bash
cp .env.example .env.local
```

Por padrão `.env.local` já aponta para `http://localhost:8080`
(`NEXT_PUBLIC_API_BASE_URL`). Só edite esse valor se o seu backend estiver
rodando em outra porta/host (ex.: apontar para a instância de teste no
Render, `https://challengebackend-2l5x.onrender.com`).

### 4. Rode o front-end em modo desenvolvimento

```bash
npm run dev
```

Acesse **http://localhost:3000**.

### 5. Entre com uma conta de teste

Contas já semeadas no banco do backend (senha `senha123` para todas):

| Email | Papel | O que dá pra fazer |
|---|---|---|
| `cliente@verzel.com` | Cliente | Buscar eventos, comprar ingressos, ver "Meus ingressos" |
| `organizador@verzel.com` | Organizador | Criar, editar e excluir eventos |
| `portaria@verzel.com` | Portaria | Validar ingressos na entrada (câmera ou digitação) |

## Rodando os testes

```bash
npm test
```

Roda a suíte inteira uma vez (Vitest + React Testing Library). Para modo
watch durante o desenvolvimento:

```bash
npm run test:watch
```

## Build de produção

```bash
npm run build
npm start
```

> O script `build` usa `next build --webpack` em vez do Turbopack padrão.
> Nesta configuração específica, o Turbopack falha ao empacotar o binário
> nativo do `@tailwindcss/oxide` durante a geração de páginas estáticas —
> `next dev` com Turbopack funciona normalmente, só o build de produção
> precisa do webpack.

## Lint

```bash
npm run lint
```

## Problemas comuns

- **Erros de CORS no console do navegador**: confirme que o backend está
  rodando e que a origem `http://localhost:3000` está liberada nele (a
  configuração de CORS é do lado do backend, não deste projeto).
- **Tela em branco / "Não foi possível conectar ao servidor"**: o backend
  não está no ar na URL configurada em `NEXT_PUBLIC_API_BASE_URL`. Confira o
  passo 1.
- **Leitura de QR pela câmera não funciona**: o navegador precisa de acesso
  à câmera liberado para `localhost`; em `http://` (não `https://`) alguns
  navegadores restringem isso fora de `localhost`. A digitação manual do
  código sempre funciona como alternativa em `/gate`.
- **Apontando para o backend publicado no Render**: a instância gratuita
  "hiberna" após inatividade — a primeira requisição depois de um tempo
  ocioso pode levar 30–50s.

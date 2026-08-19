# API Integration Foundation + Auth — Design

Date: 2026-08-19
Branch: `feature/api-integration`

## Context

EventTix currently runs entirely on mock, in-memory Zustand stores
(`src/lib/stores/authStore.ts`, `src/lib/stores/dataStore.ts`), seeded from
`src/lib/seed.ts`. A real backend now exists at
`/Users/nrafaels/verzel/backend/challengebackend` — a Spring WebFlux
(reactive, R2DBC) service with JWT auth, event management, seat/quantity
reservations with a hold-and-expire flow, real Stripe payment confirmation,
gate validation, and a ticket-sharing feature the frontend doesn't have yet.

The backend's contract differs from the frontend's mock model in several
ways: Portuguese field/enum names (`tipoAcesso`, `categoria`, `formaVenda`),
a 5-state `StatusIngresso` instead of the mock's `valid`/`used`, and ticket
validation by `ingressoId` rather than a random `code`. Full integration is
too large for one spec (it touches auth, events CRUD, checkout/payment, gate
validation, and a new sharing feature), so this is phase 1: **the API client
foundation and authentication only**. Events, reservations/checkout, gate
validation, and ticket sharing are separate follow-up specs, each building
on the foundation laid out here.

## Goals

- Establish the pattern the rest of the integration will reuse: a typed API
  client, a consistent error shape, and a boundary that translates between
  the backend's Portuguese DTOs and the frontend's existing English types.
- Replace the mock `authStore` (email-only, synchronous, no real password
  check) with real login against `POST /auth/login`, session rehydration on
  page load, and logout that revokes the token server-side.
- Keep every consumer of `authStore` (`RoleGuard`, `Navbar`, `LoginPage`)
  working against the same `Role`/`AuthUser` shapes they already use.

## Non-goals

- Events, reservations, checkout/Stripe, gate validation, and ticket
  sharing integration — separate future specs.
- Fixing CORS on the backend. The backend has no `CorsConfigurationSource`
  today, so browser calls from the Next.js dev origin to the backend origin
  will be blocked as-is. This is called out as a **blocking external
  dependency**, not solved in this repo.
- `dataStore` — untouched, stays mock until its own phase.
- Refresh tokens / silent re-auth — the backend issues a single 1-hour JWT
  with no refresh endpoint, so there is nothing to build here beyond
  reacting to expiry.

## Architecture

New `src/lib/api/` module:

```
src/lib/api/
  client.ts   — fetch wrapper: base URL, Authorization header, JSON parsing, ApiError
  auth.ts     — login/me/logout calls + request/response mappers
```

- **Base URL**: `NEXT_PUBLIC_API_BASE_URL` env var, default
  `http://localhost:8080`. Documented in a new `.env.example` and the
  README. The frontend calls the backend origin directly (no dev proxy) —
  CORS is a backend-side fix, tracked as an external dependency.
- **`client.ts`** exports `apiFetch<T>(path, options)`:
  - Injects `Authorization: Bearer <token>` when a token is present.
  - Parses JSON responses.
  - On a non-2xx response, builds a typed `ApiError` from the backend's
    `ErrorResponse` (`{ status, error, message, path, errors? }`):
    `ApiError { status, message, fieldErrors? }`.
  - On a network failure (backend unreachable, CORS block — the state a dev
    will actually hit first until CORS is fixed), throws a distinct
    `ApiError { status: 0, message: 'não foi possível conectar ao servidor' }`
    rather than letting the raw fetch rejection leak through.
  - Accepts a module-level `onUnauthorized` callback, invoked whenever any
    call returns 401, so a single hook (wired from `AuthProvider`) can clear
    the session and redirect on token expiry/revocation from anywhere in
    the app.
- **`auth.ts`** wraps `POST /auth/login`, `GET /auth/me`, `POST
  /auth/logout`, and maps backend ↔ frontend shapes so nothing outside
  `lib/api/` ever sees a Portuguese field name:
  - `TipoAcesso → Role`: `ORGANIZADOR → organizer`, `CLIENTE → customer`,
    `PORTARIA → gate`.
  - `MeResponse` (`id, nome, sobrenome, email, tipoAcesso`) → `AuthUser`
    (`id, name, email, role`), with `name = \`${nome} ${sobrenome}\``.

## Auth flow

`authStore` gains an explicit status and becomes async:

```ts
type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

type AuthState = {
  currentUser: AuthUser | null
  status: AuthStatus
  login: (email: string, password: string) =>
    Promise<{ success: true } | { error: string; fieldErrors?: Record<string, string> }>
  logout: () => Promise<void>
  init: () => Promise<void>
}
```

- **`login(email, password)`**: `POST /auth/login` → on success, store the
  JWT in `localStorage` → `GET /auth/me` (the login response only has
  `token` + `tipoAcesso`, no name) → set `currentUser`, `status:
  'authenticated'`. On 401 → `{ error: 'Email ou senha inválidos' }`. On 400
  → surface the backend's field-level `errors` map alongside a generic
  message.
- **`init()`**: called once from a small client `AuthProvider` mounted in
  the root layout. If a token exists in `localStorage`: set `status:
  'loading'`, call `GET /auth/me` to validate it server-side (this also
  catches revoked/expired tokens that a local JWT decode couldn't) and
  populate `currentUser` on success; on failure, clear `localStorage` and
  set `status: 'unauthenticated'`. If no token: go straight to
  `unauthenticated`.
- **`logout()`**: `POST /auth/logout` (best-effort — revokes the token
  server-side via its `jti`), then clears `localStorage` and `currentUser`
  regardless of whether the call succeeds.
- **Token storage**: `localStorage`, matching the backend's contract (no
  `Set-Cookie`, no refresh flow). Persists across reloads/tabs. Noted
  tradeoff: vulnerable to exfiltration via XSS; acceptable for this
  challenge's scope.

**`RoleGuard`** gains a third state: while `status === 'loading'` it keeps
showing the existing "Redirecionando..." placeholder without redirecting;
it only redirects to `/login` once `status === 'unauthenticated'`.
Otherwise a page refresh would flash a redirect before the rehydration call
(`init()`) resolves.

**Login page**: wire up the currently-unbound password field, add a
submitting state (disable the button, show a spinner/label), and render
field-level errors from a 400 response next to the relevant inputs, in
addition to the existing generic error banner. Update the test-account
hint text and the README's test-account table from the old mock accounts
(`cliente@teste.com`, etc.) to the real seeded ones:

| Email | Role | Password |
|---|---|---|
| organizador@verzel.com | Organizador | senha123 |
| cliente@verzel.com | Cliente | senha123 |
| portaria@verzel.com | Portaria | senha123 |

## Error handling

- `ApiError { status, message, fieldErrors? }` is the one error shape every
  `lib/api/*` function throws. Callers (store actions, eventually page
  components in later phases) catch it and decide UX — generic banner vs.
  field-level messages.
- Network/CORS failures are normalized into the same `ApiError` shape
  (`status: 0`) so calling code never has to special-case a raw fetch
  rejection.

## Testing

Existing setup: Vitest + React Testing Library
(`vitest.config.ts`/`vitest.setup.ts`), no MSW installed.

- `lib/api/client.ts`: unit tests with a mocked global `fetch` (`vi.fn`) —
  cover header injection, success parsing, `ApiError` mapping for 400/401,
  and the network-failure fallback.
- `lib/api/auth.ts`: unit tests mocking `client.ts`'s `apiFetch` — cover
  the `TipoAcesso`/`MeResponse` → `Role`/`AuthUser` mappers.
- `authStore`, `LoginPage`, `RoleGuard`: tests mock `lib/api/auth.ts`
  directly (consistent with how current tests mock `dataStore`/`seed`
  rather than reaching into lower layers).

## Open external dependency

CORS must be enabled on the backend (a `CorsConfigurationSource` permitting
the frontend's dev/prod origins) before this integration works end-to-end
in a browser. This is tracked as a blocker owned outside this repo, not
solved here.

## Implementation process

The implementation plan for this spec (and every later phase) is broken
into discrete steps. At the end of each step, stop: do not commit, and
wait for the user's review before starting the next step. This applies for
the rest of the API integration work, not just this phase.

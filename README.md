# Metria Software

Desktop app **Tauri 2 + Nuxt 4** (SPA, `ssr: false`) pour le SaaS Metria.

## Prérequis

- Node.js ≥ 24.17 (`nvm use` via `.nvmrc`)
- Rust (toolchain récente, voir `src-tauri/Cargo.toml` → `rust-version`)
- Dépendances système Tauri 2 ([prerequisites](https://v2.tauri.app/start/prerequisites/))

## Setup

```bash
npm install
cp .env.example src-nuxt/.env.development   # déjà présent dans le repo pour le dev
```

Variables publiques (pas de secrets) :

| Variable                     | Exemple                                                 |
| ---------------------------- | ------------------------------------------------------- |
| `NUXT_PUBLIC_NODE_ENV`       | `development` / `staging` / `production`                |
| `NUXT_PUBLIC_APP_IDENTIFIER` | `com.metria.app.dev` (+ `.staging` / prod sans suffixe) |
| `NUXT_PUBLIC_BASE_URL_API`   | `http://localhost:8080`                                 |

## Lancer

### Nuxt seul (navigateur)

```bash
npm run web:run:dev:spa
```

Ouvre http://localhost:1470 — écran update (skip en `development`) puis `/login`.

### Desktop Tauri

```bash
npm run desktop:run:dev
```

Compile le front (static + spa) puis lance la fenêtre frameless (290×380 sur `/`).

### Gates qualité

```bash
npm run lint
npm run test:unit:dev
npm run desktop:check:compile
```

## Structure

- `src-nuxt/` — Nuxt 4 (`srcDir: app`), Nuxt UI v4, Tailwind v4, Pinia, Manrope
- `src-tauri/` — shell Rust (plugins fs / http / opener / updater / process / os), capabilities minimales
- `src-core/` — TS partagé (`#src-core`), SettingsStorage générique

## Fenêtres & updater

Flux : `/` (update, 290×380) → `/login`|`/signup` (400×595) → `/home` (1280×720, layout shell) ↔ `/pricing` · `/ai` · `/consommation`.

- Gate update : **check en `production` / `staging`**, **skip en `development`** (correctif vs prospectresearch).
- Endpoint Tauri : core-api `GET /software/updater/{{target}}/{{arch}}/{{current_version}}` (204 = à jour).
- Signature : `pubkey` dans `src-tauri/tauri.conf.json`. Builds signés : fournir `TAURI_SIGNING_PRIVATE_KEY` (jamais committer la clé privée).

## Dépendances

Bump npm (ncu) et crates.io appliqués dans la mesure où le build reste vert. Majors différés volontairement : `pinia` 4 / `@pinia/nuxt` 1, `typescript` 7, `npm-check-updates` 23.

## Pricing / essai

- Page informative `/pricing` (plan Business 499 €/mois, essai 5 j, conso IA à l’usage, modèles locaux « bientôt disponible »).
- Pas de checkout Stripe (BACKLOG).
- Bandeau shell « essai : J-x » — **placeholder local** (`SubscriptionTrialService`) car core-api n’expose pas encore `GET /subscription` (`trialEndsAt`). Brancher l’API dès dispo.
- `HttpClientService` : HTTP 402 → callback injecté → navigation `/pricing` (pas d’import Nuxt dans `src-core`).

## Choix IA / consommation

- Page `/ai` — catalogue grand public (Anthropic premium, OpenAI, modèles locaux « bientôt disponible »), préférence via `GET|PUT /tenants/me/ai-preference`.
- Page `/consommation` — coût organisation + utilisateur courant via `GET /usage?from&to` (plage : mois UTC en cours).
- Accès depuis le shell `/home`.

## Slice actuelle

**(e)** choix IA + consommation — dernière slice `v0.1.0` software. Next : smoke E2E.

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

Ouvre http://localhost:1470 — page placeholder « Metria ».

### Desktop Tauri

```bash
npm run desktop:run:dev
```

Compile le front (static + spa) puis lance la fenêtre frameless.

### Gates qualité

```bash
npm run lint
npm run test:unit:dev
npm run desktop:check:compile
```

## Structure

- `src-nuxt/` — Nuxt 4 (`srcDir: app`), Nuxt UI v4, Tailwind v4, Pinia, Manrope
- `src-tauri/` — shell Rust (plugins fs / http / opener), capabilities minimales
- `src-core/` — TS partagé (`#src-core`), SettingsStorage générique

## Dépendances

Bump npm (ncu) et crates.io appliqués dans la mesure où le build reste vert. Majors différés volontairement : `pinia` 4 / `@pinia/nuxt` 1, `typescript` 7, `npm-check-updates` 23.

## Slice actuelle

**(a)** base strippée + tooling. Next : **(b)** auth screens + stores.

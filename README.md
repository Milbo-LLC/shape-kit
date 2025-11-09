# Shape Kit

A Turborepo workspace that powers the Shape Kit API, playground, and shared packages.

## Prerequisites

- **Node.js** 18 or newer
- **pnpm** 9 (the workspace pins `pnpm@9.0.4` in `packageManager`)

Install pnpm with Corepack if you have not already:

```bash
corepack enable
corepack prepare pnpm@9.0.4 --activate
```

## Install dependencies

From the repository root run:

```bash
pnpm install
```

This installs dependencies for every workspace.

## Workspace layout

- `apps/api` – Hono server for backend API routes.
- `apps/playground` – Next.js UI for experimenting with Shape Kit features.
- `packages/trpc` – Shared tRPC procedures and client helpers.
- `packages/db` – Drizzle ORM schema and migration helpers.
- `packages/cad-core` – CAD geometry bindings and operations.
- `packages/auth` – Authentication utilities (Better Auth).
- `packages/config` – Shared ESLint, Prettier, and TypeScript configs used across the repo.

## Running locally

### Start all dev servers

Run every workspace `dev` script in parallel with Turbo:

```bash
pnpm dev
```

This starts the Hono API (default `localhost:3001`) and the Next.js playground (default `localhost:3000`).

### Start a single workspace

Use pnpm's filter flag to target the workspace you need:

```bash
pnpm --filter @shape-kit/api dev
pnpm --filter @shape-kit/playground dev
```

## Quality checks

The root scripts proxy Turbo's pipeline so you can run repo-wide commands:

```bash
pnpm lint   # eslint/next lint for every workspace
pnpm test   # vitest across packages and apps
pnpm build  # production builds
```

As with `dev`, you can target individual workspaces via `--filter`.

## Additional tips

- Turbo caches build artifacts automatically; wipe cache with `pnpm turbo clean` if needed.
- When adding new packages/apps, update `pnpm-workspace.yaml` and `turbo.json` to register them.


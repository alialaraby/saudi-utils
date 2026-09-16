# Saudi Utils Requirements

## Package foundation

- The working npm package name is `saudi-utils`.
- The initial version is `0.1.0`, and the package remains private until release readiness.
- The package uses the MIT license and supports Node.js 22 or newer.
- The package is ESM-only, has named exports only, exposes only its root entry point, and declares
  itself free of side effects.
- TypeScript is strict and compiles directly with `tsc`; no bundler is used.
- Production code has zero runtime dependencies.

## Package output

- Source under `src/` compiles into `dist/` as ES2022 JavaScript.
- Builds include JavaScript, TypeScript declarations, declaration maps, and source maps.
- Package metadata defines `main`, `types`, and the root `exports` entry.
- The future published package is limited to its compiled output and npm's required metadata; tests,
  source, and development configuration are excluded.

## Development quality

- TypeScript, Vitest with V8 coverage, ESLint flat configuration with `typescript-eslint`, and
  Prettier provide the development toolchain.
- Formatting validation, linting, type checking, tests with coverage, and a clean build must all pass
  through `npm run check`.
- A smoke-only export and test verify the Phase 1 toolchain without establishing a domain API.

## Phase 1 exclusions

Phase 1 must not include validators, normalizers, checksum algorithms, domain modules, framework
integrations, class architecture, a generic validation engine, CI workflows, publishing workflows,
or any other future-phase implementation.

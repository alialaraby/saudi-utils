# Saudi Utils — Implementation Roadmap

> [!IMPORTANT]
> **Roadmap status:** Ready for phase-by-phase execution
>
> **Companion specification:** [`requirements.md`](./requirements.md)
>
> **Workflow:** Execute one phase at a time, review its diff and command output, then update its
> status here.

**Overall progress:** `██████░░░░░░` **6 of 12 phases complete (50%)**

`✅ Complete` · `🟨 In progress` · `⬜ Not started` · `⛔ Blocked`

### Delivery path

```mermaid
flowchart LR
  P0["0 · Decisions"] --> P1["1 · Bootstrap"] --> P2["2 · Primitives"]
  P2 --> P3["3 · Identity"] --> P4["4 · IBAN"] --> P5["5 · Business / tax"]
  P5 --> P6["6 · Telecom"] --> P7["7 · Address"] --> P8["8 · Hardening"]
  P8 --> P9["9 · Documentation"] --> P10["10 · CI / release"] --> P11["11 · Release readiness"]

  classDef complete fill:#1f883d,color:#fff,stroke:#116329;
  classDef next fill:#fff8c5,color:#24292f,stroke:#9a6700,stroke-width:2px;
  classDef planned fill:#f6f8fa,color:#57606a,stroke:#8c959f;
  class P0,P1,P2,P3,P4,P5,P6 complete;
  class P7 next;
  class P8,P9,P10,P11 planned;
```

### Quick navigation

[Technical decisions](#1-frozen-technical-decisions) · [Phase status](#2-phase-status) ·
[Operating procedure](#3-operating-procedure) · [Next: Phase 7](#phase-7--national-address-validators) ·
[Release gate](#4-release-gate)

## 1. Frozen technical decisions

| Decision             | V1 choice                                                          | Rationale                                                                         |
| -------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Package model        | Real npm library; no application/framework layer                   | Reusable pure validation code                                                     |
| Project/package name | `saudi-utils`, pending live npm registry availability verification | Final user-selected name; stop for an explicit scope/name decision if unavailable |
| Language             | Strict TypeScript                                                  | First-class declarations and maintainable contracts                               |
| Runtime modules      | ESM-only, `"type": "module"`                                       | One modern artifact; no dual-package hazards                                      |
| Node support         | `>=22`; CI on 22, 24, 26 while supported                           | Current maintained releases                                                       |
| Browser support      | Natural ESM compatibility; no Node built-ins                       | Pure functions work in modern bundlers/browsers                                   |
| Build                | `tsc`, ES2022, NodeNext                                            | A bundler has no material V1 benefit                                              |
| Runtime dependencies | None                                                               | Rules require only small deterministic algorithms                                 |
| Public entry points  | Root export only                                                   | Stable surface; subpaths add no current value                                     |
| Tree shaking         | Named ESM exports, pure modules, `sideEffects: false`              | Consumers can remove unused validators                                            |
| Types                | `.d.ts` and declaration maps shipped                               | Autocomplete without extra packages                                               |
| Tests                | Vitest/V8 coverage; packed-tarball consumer fixtures               | Branch and real-consumer verification                                             |
| Package validation   | `publint`, `@arethetypeswrong/cli`, `npm pack --dry-run --json`    | Export/type/content auditing                                                      |
| Release              | GitHub Actions trusted publishing with npm provenance              | Traceable artifact; no long-lived npm token                                       |
| Versioning           | Start `0.1.0`; stable `1.0.0` after API/evidence audit             | Honest maturity signal                                                            |
| License              | MIT                                                                | Familiar permissive OSS license                                                   |

## 2. Phase status

| Phase | Scope                                  |   Status    | Exit condition                                           |
| ----: | -------------------------------------- | :---------: | -------------------------------------------------------- |
|     0 | Final technical and evidence decisions | ✅ Complete | Requirements and roadmap freeze package-level choices    |
|     1 | Repository bootstrap                   | ✅ Complete | Install, build, test, lint, format-check, typecheck pass |
|     2 | Shared validation primitives           | ✅ Complete | Result/error behavior and internal helpers fully tested  |
|     3 | Identity                               | ✅ Complete | National ID, Iqama, Saudi ID/type, Border ID pass        |
|     4 | IBAN                                   | ✅ Complete | Structure, MOD-97, normalize, format pass                |
|     5 | Business/tax                           | ✅ Complete | VAT, TIN, UNN, legacy CR pass                            |
|     6 | Telecom                                | ✅ Complete | Mobile, landline, toll-free, normalize pass              |
|     7 | National Address                       | ✅ Complete | Components, Short Address, object validation pass        |
|     8 | Cross-domain hardening                 | ✅ Complete | Adversarial/property/performance/coverage gates pass     |
|     9 | README and documentation               | ✅ Complete | npm/GitHub docs accurately cover every contract          |
|    10 | CI and release automation              | ✅ Complete | CI matrix and trusted-publish workflow validate          |
|    11 | npm release readiness                  | ✅ Complete | Packed artifact, metadata, consumers, size all pass      |

## 3. Operating procedure

1. Change one phase to `🟨 In progress`.
2. Paste only that phase's prompt into VS Code Codex.
3. Codex must inspect the repository first and preserve unrelated work.
4. Do not authorize later phases.
5. Review the diff and all command output.
6. Fix defects before advancing.
7. Mark `✅ Complete`, or `⛔ Blocked` with a short evidence-backed reason.

Filenames below are the expected design. Codex may propose a small change after inspection, but must explain it and not broaden scope.

---

## Phase 0 — Final technical and evidence decisions

> **Phase status:** ✅ Complete

### Objective

Freeze requirements, evidence levels, public API, module strategy, compatibility, package surface, and release approach before code.

### Files

- `docs/requirements.md`
- `docs/roadmap.md`
- No runtime code

### Remaining executable check

At Phase 1 start, run `npm view saudi-utils name version --json`. A package result means occupied. A registry 404 means currently unclaimed but does not reserve it. If occupied, stop for the owner's scope/name choice; do not invent a typo variant.

### Acceptance criteria

- Every validator has a contract, evidence level, and limitation.
- Module/package decisions are explicit.
- Phases can be executed independently in order.

### Tests

- Documentation consistency review only.

### VS Code Codex prompt

```text
Inspect the existing repository first. Add the approved requirements and roadmap under docs/ without implementing runtime code. Verify consistency of API names, evidence levels, module strategy, and phase order. Do not start Phase 1. Summarize changed files and any contradiction.
```

---

## Phase 1 — Repository bootstrap

> **Phase status:** ✅ Complete

### Objective

Create the smallest professional TypeScript npm-library skeleton and prove the toolchain.

### Files likely created/changed

- `package.json`, `package-lock.json`, `tsconfig.json`
- `vitest.config.ts`, `eslint.config.js`
- `.prettierrc.json`, `.prettierignore`, `.gitignore`, `.npmrc`
- `src/index.ts`, `test/smoke.test.ts`
- `LICENSE`, `docs/requirements.md`, `docs/roadmap.md`

### Tasks

- Check npm name; stop for a decision if occupied.
- Initialize `0.1.0`, `"private": true` during development, MIT, ESM, Node `>=22`, `sideEffects: false`, empty `dependencies`, intentional `files`/`exports`.
- Add `clean`, `build`, `typecheck`, `test`, `test:coverage`, `lint`, `format`, `format:check`, `check` scripts.
- Configure strict TypeScript, declarations/maps, source maps, NodeNext, ES2022, `src` → `dist`.
- Configure Vitest and initial 100% thresholds.
- Add a minimal smoke export/test only.

### Acceptance criteria

- Fresh `npm ci` and `npm run check` pass.
- `dist/index.js`, `.d.ts`, and maps are the only build output.
- Node ESM imports `dist`; `npm ls --omit=dev` is empty.
- No validator exists.

### Tests

- Smoke import, emitted declaration, built ESM import.

### VS Code Codex prompt

```text
Inspect the repository and docs first. Implement only Roadmap Phase 1: the minimal ESM TypeScript npm-library bootstrap. Check the live npm availability of the working name and stop if occupied. Add tooling and a smoke export/test, but no validators. Run install, format-check, lint, typecheck, coverage, build, an ESM import of dist, and npm ls --omit=dev. Summarize changed files, command results, and decisions.
```

---

## Phase 2 — Shared validation primitives

> **Phase status:** ✅ Complete

### Objective

Implement the common result contract and only the small internal primitives proven necessary.

### Files likely created/changed

- `src/types.ts`
- `src/internal/input.ts`, `src/internal/ascii.ts`
- `src/internal/mod97.ts`, `src/internal/identity-checksum.ts`
- `src/index.ts`
- `test/types.test.ts`
- `test/internal/{input,ascii,mod97,identity-checksum}.test.ts`

### Tasks

- Export specified public types.
- Implement required/type handling and deterministic precedence without coercion.
- Add minimal ASCII/exact-length helpers, incremental MOD-97, and one identity checksum routine.
- Keep internals unexported; no validator factory.

### Acceptance criteria

- Precedence matches requirements; helpers are pure/bounded/internal.
- Representative consumer types compile.
- No domain validator is exported.

### Tests

- Every input type branch and Unicode family.
- MOD-97 against a BigInt test-only oracle.
- Identity reference/mutation cases at helper level.
- 100% branches for new runtime code.

### VS Code Codex prompt

```text
Inspect the repository, requirements, and completed phases first. Implement only Phase 2 public types and minimal internal primitives. Preserve strict no-coercion behavior and exact error precedence; add no domain validators or generic engine. Add focused unit/type tests including Unicode and a test-only BigInt oracle. Run format-check, lint, typecheck, coverage, and build. Summarize changed files, results, and assumptions.
```

---

## Phase 3 — Identity validators

> **Phase status:** ✅ Complete

### Objective

Implement National ID, Iqama, Saudi ID/type detection, and evidence-limited Border ID.

### Files likely created/changed

- `src/identity.ts`, `src/index.ts`
- `test/identity.test.ts`, `test/fixtures/identity.ts`
- `docs/evidence.md`

### Tasks

- Detailed validators first; boolean helpers wrap them.
- Reuse one checksum; compose generic Saudi ID APIs.
- Border ID accepts the documented 10-digit prefixes `3` or `4` only, with no checksum claim.
- Record evidence/limitations before export.

### Acceptance criteria

- All nine identity APIs are root exports.
- Prefix/checksum/cross-type results are exact.
- Border limitations are prominent; no other domain implemented.

### Tests

- Reference vectors with provenance comments, checksum-zero, every-digit mutation.
- National/Iqama cross-type invariants.
- Border prefixes `3`,`4`; reject `1`,`2`,`5`,`6`,`7` and others.
- Full adversarial matrix, 1 MiB rejection, wrapper equivalence, coverage.

### VS Code Codex prompt

```text
Inspect the repository, requirements, evidence notes, and prior tests first. Implement only Phase 3 identity APIs using existing primitives. National ID/Iqama use the documented community-supported checksum; Saudi ID composes them; Border ID is best-known structure only. Add evidence-aware fixtures and adversarial/cross-type/mutation tests. Do not implement other domains. Run the full check suite and summarize changed files, results, and evidence assumptions.
```

---

## Phase 4 — Saudi IBAN

> **Phase status:** ✅ Complete

### Objective

Implement canonical structure, MOD-97, explicit normalization, and formatting.

### Files likely created/changed

- `src/banking.ts`, `src/index.ts`
- `test/banking.test.ts`, `test/fixtures/iban.ts`
- `docs/evidence.md`

### Tasks

- Enforce length, ASCII layout, `SA`, numeric check/bank digits, then checksum.
- Reuse incremental MOD-97; production uses neither full `Number` nor BigInt.
- Normalize only ASCII spaces/case; format only valid canonical input.

### Acceptance criteria

- Four root APIs; correct precedence and non-Saudi rejection.
- Normalization is explicit/idempotent.

### Tests

- Official/reference and synthetic fixtures, BigInt oracle, every-position mutations.
- Lowercase/space normalization boundaries; NBSP/hyphen/invisible rejection.
- Valid non-Saudi IBAN, long input, full adversarial matrix.

### VS Code Codex prompt

```text
Inspect the repository and requirements first. Implement only Phase 4 banking APIs with existing incremental MOD-97. Keep validation canonical and normalization narrowly explicit. Add authoritative/synthetic fixtures, a test-only oracle, mutation, non-Saudi, and adversarial tests. Do not implement later domains. Run the full check suite and summarize changed files, results, and assumptions.
```

---

## Phase 5 — Business and tax validators

> **Phase status:** ✅ Complete

### Objective

Implement VAT, ZATCA TIN, Unified National Number, and legacy CR without overstating evidence.

### Files likely created/changed

- `src/business.ts`, `src/index.ts`
- `test/business.test.ts`, `test/fixtures/business.ts`
- `docs/evidence.md`

### Tasks

- Implement four detailed validators and four wrappers.
- Preserve intentional overlap among 10-digit best-known grammars.
- Document TIN/legacy CR ambiguity next to examples.

### Acceptance criteria

- Eight root APIs.
- VAT/UNN match authoritative structure.
- TIN/CR remain `best-known-structural`; no aliases or live-state claim.

### Tests

- VAT boundary digits, TIN/CR exact shape, UNN `7` including non-`700`.
- Explicit overlap matrix and inherited adversarial suite.

### VS Code Codex prompt

```text
Inspect the repository, requirements, and evidence document first. Implement only Phase 5 business/tax APIs as explicit functions. Preserve evidence-limited contracts and intentional overlaps; invent no checksum or live verification. Add boundary, overlap, Unicode, type, and long-input tests. Run the full check suite and summarize changed files, results, and limitations.
```

---

## Phase 6 — Telecom validators and normalization

> **Phase status:** ✅ Complete

### Objective

Implement mobile, landline, toll-free, and explicit normalization without carrier claims.

### Files likely created/changed

- `src/telecom.ts`, `src/index.ts`
- `test/telecom.test.ts`, `test/fixtures/telecom.ts`
- `docs/evidence.md`

### Tasks

- Canonical national/E.164 mobile and landline; all documented area codes.
- Toll-free national-only.
- Normalize only documented unseparated representations to the discriminated union.

### Acceptance criteria

- Seven root APIs; normalization idempotent.
- No international toll-free invention or carrier API.

### Tests

- Mobile forms; every valid/adjacent invalid landline code.
- `800` vs `9200`; all normalization prefixes and malformed combinations.
- Extensions, whitespace, punctuation, Unicode, long input, equivalence.

### VS Code Codex prompt

```text
Inspect the repository and requirements first. Implement only Phase 6 telecom APIs. Follow the exact national/E.164 contracts, area-code list, national-only toll-free rule, and discriminated normalization result. Add exhaustive code/prefix/adversarial tests and no carrier inference. Run the full check suite and summarize changed files, results, and assumptions.
```

---

## Phase 7 — National Address validators

> **Phase status:** ✅ Complete

### Objective

Implement components, Short Address normalization, and safe object validation.

### Files likely created/changed

- `src/address.ts`, `src/index.ts`
- `test/address.test.ts`, `test/fixtures/address.ts`
- `docs/evidence.md`

### Tasks

- Component validators/wrappers and narrow Short Address normalizer.
- Defensive own-property object validation with deterministic field order and no prototype assumptions.
- Return a fresh `NationalAddress`, not the caller's mutable object.

### Acceptance criteria

- All specified address exports; leading zeroes preserved.
- Extra fields ignored/not copied; inherited/array/missing/wrong-type cases fail predictably.
- Text fields are unnormalized primitive non-empty strings.

### Tests

- Exact length/case/mutations and normalizer boundaries.
- Missing fields one by one and deterministic first error.
- Extra, inherited, accessor, pollution-key, null-prototype cases.
- Returned-copy behavior and full adversarial/1 MiB suite.

### VS Code Codex prompt

```text
Inspect the repository and requirements first. Implement only Phase 7 National Address APIs, including defensive own-property object validation returning a fresh value. Preserve deterministic field precedence and ignore—but do not copy—extra fields. Add Unicode, shape, prototype, accessor, mutation, and long-input tests. Run the full check suite and summarize changed files, results, and assumptions.
```

---

## Phase 8 — Cross-domain hardening

> **Phase status:** ✅ Complete

### Objective

Audit the complete runtime API; eliminate untested branches; add high-value generative, performance, and safety checks.

### Files likely created/changed

- `test/adversarial.test.ts`, `test/invariants.test.ts`
- `test/performance.test.ts`, `test/public-api.test.ts`
- `test/fixtures/adversarial.ts`, `vitest.config.ts`
- Runtime modules only to fix demonstrated defects

### Tasks

- Shared adversarial corpus plus domain expectations.
- Deterministic property/mutation tests; `fast-check` only if materially useful.
- Regex anchoring/backtracking audit and coarse non-flaky extreme-input tests.
- Public exports, side effects, and runtime dependency audit.

### Acceptance criteria

- 100% runtime statements/functions/lines/branches, or reviewed documented exception.
- Wrapper equivalence and normalizer idempotence.
- 1 MiB hostile input rejects promptly; no side effects; runtime dependency tree empty.

### Tests

- Shared adversarial matrix, cross-validator invariants, checksum mutations.
- Public export/type audit and extreme-input execution.

### VS Code Codex prompt

```text
Inspect the implemented library and tests first. Implement only Phase 8 hardening: shared adversarial coverage, invariants, deterministic mutation/property checks, regex review, public-export audit, and coarse 1 MiB tests. Change runtime code only for a demonstrated defect and document it. Do not start docs/CI. Run the full coverage suite and summarize findings, files, and justified gaps.
```

---

## Phase 9 — README and project documentation

> **Phase status:** ✅ Complete

### Objective

Create accurate npm/GitHub documentation that makes evidence and limitations unmistakable.

### Files likely created/changed

- `README.md`, `docs/evidence.md`, optional `docs/api.md`
- `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`
- `.github/ISSUE_TEMPLATE/{bug_report,evidence_update}.yml`
- `.github/pull_request_template.md`

### Tasks

- Installation, ESM quick start, APIs, inputs, normalizers, errors, compatibility, evidence, non-verification guarantee.
- Prominent Border ID/TIN/legacy CR limitations.
- Development/security/contribution guidance and Keep a Changelog.
- Only working badges; no fake status/activity.

### Acceptance criteria

- Users can select APIs and interpret `true` correctly.
- Every export documented; npm Markdown portable; examples compile.
- No claim exceeds evidence.

### Tests

- Typecheck extracted example fixture; local link/format checks.

### VS Code Codex prompt

```text
Inspect the implemented API, requirements, evidence, and tests first. Implement only Phase 9 documentation: npm-quality README, evidence/API docs, contribution/security guidance, changelog, and focused templates. Keep limitations prominent and make examples compile against actual exports. Add no CI/release workflows. Run existing checks plus example/type/link checks; summarize files and any API-doc mismatch.
```

---

## Phase 10 — CI and release automation

> **Phase status:** ✅ Complete

### Objective

Add reproducible GitHub checks and secure npm publishing automation without publishing.

### Files likely created/changed

- `.github/workflows/ci.yml`, `.github/workflows/release.yml`
- `.github/dependabot.yml`, `package.json`, `docs/releasing.md`

### Tasks

- CI Node 22/24/26 while supported, `npm ci`, full quality suite.
- Add `publint`, `attw --pack`, and pack dry-run audits.
- Trusted publishing/OIDC/provenance release workflow behind protected environment.
- Publish job alone gets `id-token: write`; never publish on PRs; no long-lived token.

### Acceptance criteria

- Workflow syntax and branch CI pass.
- Publish job builds/tests/packs first with least privilege.
- Dry run reaches guarded publish boundary without publishing.
- Release doc covers npm/GitHub settings and rollback/deprecation.

### Tests

- Workflow lint where available, local checks/package audits, hosted matrix.

### VS Code Codex prompt

```text
Inspect the repository, metadata, current npm trusted-publishing docs, and completed checks first. Implement only Phase 10 CI/release automation. Add a supported-Node matrix, package audits, Dependabot, and least-privilege OIDC/provenance workflow that cannot publish on PRs. Do not publish. Add release docs, validate workflows, run local checks, and summarize files, permissions, and owner settings.
```

---

## Phase 11 — npm release readiness

> **Phase status:** ✅ Complete

### Objective

Audit the exact tarball and produce a go/no-go record for `0.1.0`.

### Files likely created/changed

- `package.json`, `README.md`, `CHANGELOG.md`, `docs/releasing.md`
- `test/consumer/esm/{package.json,index.mjs}`
- `test/consumer/types/{package.json,index.ts,tsconfig.json}`
- `release-checklist.md`
- No committed `.tgz`

### Tasks

- Recheck name/ownership; remove `private` only after confirmation.
- Finalize metadata, files, exports, engines, public access.
- Audit `npm pack --dry-run --json`; create real `.tgz` and install in isolated ESM/TS fixtures.
- Run `publint`, `attw --pack`, full checks, clean-install build, secret/license review.
- Verify README, changelog, tag/version, trusted publisher, environment, account security, public-access intent.
- Remove/ignore tarball; never commit it.

### Acceptance criteria

- Tarball contains only `dist/`, `README.md`, `LICENSE`, npm-required metadata.
- Both consumer fixtures pass; zero runtime dependencies/undeclared imports.
- Package audits pass or reviewed warnings are documented.
- Initial size budget recorded: packed ≤ 50 KiB, unpacked ≤ 250 KiB; overage requires review.
- Explicit go/no-go; no token or secret in repository/workflows.

### Tests

- Clean `npm ci && npm run check`.
- Pack JSON file/size assertions and real tarball ESM/TS consumers.
- `publint`, `attw --pack`; no actual publish.

### VS Code Codex prompt

```text
Inspect the complete repository and release checklist first. Implement only Phase 11 readiness; do not publish. Recheck name ownership, finalize metadata, audit pack JSON, test the real tarball in isolated ESM and TypeScript consumers, run publint/attw/full checks, verify zero runtime dependencies and size, and complete a go/no-go checklist. Remove the tarball afterward. Summarize files, exact packed contents/sizes, results, owner settings, and blockers.
```

---

## 4. Release gate

The first `npm publish` is outside these phases and requires explicit owner approval. Release is blocked if:

- Package name/scope ownership is unresolved.
- Docs, declarations, and runtime exports disagree.
- Evidence-limited APIs are described as authoritative verification.
- Coverage, consumer, or package audits fail.
- Tarball contents/size exceed the reviewed contract.
- Trusted publisher, protected environment, public access, or provenance is unconfigured.
- Version, tag, changelog, and GitHub Release notes disagree.

After approval, create the version/tag per `docs/releasing.md`; let the protected workflow publish with provenance; verify the npm page, README, install command, and a clean consumer install; then record the published version and URL.

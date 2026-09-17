# npm release-readiness record

Review date: 17 September 2026  
Intended first version: `saudi-utils@0.1.0`  
Decision: **GO for the documented owner-operated bootstrap after merge and a final registry recheck.**

Nothing was published, tagged, or released during this review.

## Registry and metadata

- `npm view saudi-utils` returned `E404`; the unscoped name was available when checked.
- The package name and documented initial version match the approved requirements and roadmap.
- Author, MIT license, focused keywords, exact repository/bugs/homepage URLs, Node.js `>=22`, ESM
  exports, declarations, `sideEffects: false`, public access, and the publish allowlist are set.
- `private` was removed only as part of this gated release-readiness change, after registry and
  metadata review; artifact, consumer, and documentation gates then passed before completion.
- The manifest has zero runtime dependencies.

## Packed artifact

Commands: `npm pack --dry-run --json` and `npm pack --json` with Node.js 24.20.0 and npm 11.19.0.

- Packed size: 13,250 bytes (12.94 KiB; budget: 50 KiB)
- Unpacked size: 64,958 bytes (63.44 KiB; budget: 250 KiB)
- Entry count: 47
- npm SHA-1: `9a8a3b67d06447252597ee5682771be923706f69`
- SHA-256: `e1640443dac03fdf08954e578db4d5097190b88c64fdf9684b4aa93e2eaf739b`

Exact packed file list:

```text
LICENSE
README.md
dist/address.d.ts
dist/address.d.ts.map
dist/address.js
dist/address.js.map
dist/banking.d.ts
dist/banking.d.ts.map
dist/banking.js
dist/banking.js.map
dist/business.d.ts
dist/business.d.ts.map
dist/business.js
dist/business.js.map
dist/identity.d.ts
dist/identity.d.ts.map
dist/identity.js
dist/identity.js.map
dist/index.d.ts
dist/index.d.ts.map
dist/index.js
dist/index.js.map
dist/internal/ascii.d.ts
dist/internal/ascii.d.ts.map
dist/internal/ascii.js
dist/internal/ascii.js.map
dist/internal/identity-checksum.d.ts
dist/internal/identity-checksum.d.ts.map
dist/internal/identity-checksum.js
dist/internal/identity-checksum.js.map
dist/internal/input.d.ts
dist/internal/input.d.ts.map
dist/internal/input.js
dist/internal/input.js.map
dist/internal/mod97.d.ts
dist/internal/mod97.d.ts.map
dist/internal/mod97.js
dist/internal/mod97.js.map
dist/telecom.d.ts
dist/telecom.d.ts.map
dist/telecom.js
dist/telecom.js.map
dist/types.d.ts
dist/types.d.ts.map
dist/types.js
dist/types.js.map
package.json
```

The tarball contains no tests, coverage, source configuration, internal documentation, temporary
files, secrets, GitHub configuration, or unrelated development files. The generated tarball was
removed after inspection.

## Consumer and quality gates

- Plain ESM consumer: installed the tarball in an OS temporary directory; all runtime exports and
  representative identity, IBAN, business/tax, telecom, and address calls passed.
- Strict TypeScript NodeNext consumer: installed the tarball in a separate OS temporary directory;
  all public runtime and type exports compiled.
- Runtime and declaration export sets agree; the installed manifest has no runtime dependencies.
- `publint --strict` passed.
- Are the Types Wrong passed the intended `esm-only` profile. Its CommonJS diagnostic is ignored
  by that profile because the package intentionally supports ESM only.
- Full tests, 100% coverage, typecheck, lint, formatting, build, documentation, package contents,
  and final dry-run checks passed on the supported local Node.js runtime.

## Owner gates before publication

- Recheck live name availability immediately before bootstrap publication.
- Complete the changelog's `0.1.0` release date and merge that release-preparation change.
- Follow `docs/releasing.md` for the interactive first publish, then configure the exact trusted
  publisher and protected `npm` environment for later OIDC releases.
- Verify the public package and installed artifact after publication. The manual bootstrap cannot
  carry trusted-publishing provenance; every later automated release must.

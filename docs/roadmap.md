# Saudi Utils Roadmap

## Phase 1: Repository Bootstrap

Establish the npm package foundation, strict TypeScript compilation, package output contract,
development quality tooling, documentation, and a smoke test. Phase 1 is complete only when:

- a fresh `npm ci` succeeds;
- `npm run check` succeeds;
- `dist/` contains only the intended root JavaScript, declaration, declaration map, and source map;
- Node.js can import the built package as ESM;
- `npm ls --omit=dev` confirms zero runtime dependencies; and
- inspection confirms that no future-phase implementation is present.

## Future phases

Future phases are intentionally not specified or started by the repository bootstrap. Their scope must
be approved before implementation.

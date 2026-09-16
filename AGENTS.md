# Saudi Utils — Codex Instructions

## Project purpose

Build Saudi Utils as a production-quality npm package for Saudi-specific validation and normalization.

Primary goals:

- maximum correctness
- zero runtime dependencies where reasonably possible
- very small package size
- strong TypeScript developer experience
- exhaustive edge-case coverage
- evidence-based Saudi validation rules
- clean, readable implementation
- professional open-source/npm quality

This is an npm library, not an application.

## Work discipline

Before changing code:

1. Inspect the relevant existing files.
2. Read the current task/request carefully.
3. Make only changes required for the current task.
4. Do not implement future roadmap phases unless explicitly requested.

Prefer modifying existing code over introducing new abstractions.

Do not refactor unrelated code.

Do not rename or reorganize files unless required by the task.

If requirements are ambiguous, prefer the smallest implementation consistent with existing project conventions.

## Keep token and tool usage low

Be efficient.

- Read only files relevant to the task.
- Do not scan the entire repository unless necessary.
- Do not repeatedly reopen unchanged files.
- Use targeted searches instead of broad exploration.
- Avoid long explanations while implementing.
- Do not generate large plans unless explicitly requested.
- Do not investigate hypothetical future requirements.
- Do not run expensive or broad commands when a targeted command is sufficient.
- Reuse existing patterns found in the repository.

When the requested task is complete, stop.

## Architecture

Keep the architecture intentionally simple.

Prefer:

- pure functions
- explicit named exports
- small modules
- small internal utilities
- deterministic behavior
- immutable inputs
- no side effects

Avoid unless clearly justified:

- classes
- dependency injection
- decorators
- framework abstractions
- service/repository/use-case layers
- generic validation engines
- configurable validator factories
- schema libraries
- runtime dependencies
- hidden global state

Do not introduce abstractions merely to remove a few repeated lines.

A small amount of duplication is preferable to an opaque generic validation framework.

## Runtime dependencies

Target:

```json
"dependencies": {}
```

Do not add a runtime dependency without explicit approval.

Dev dependencies are acceptable when they materially improve:

- TypeScript compilation
- testing
- linting
- formatting
- coverage
- packaging
- publishing

Prefer native JavaScript/TypeScript capabilities.

## Validation philosophy

Always distinguish:

1. structural validation
2. checksum validation
3. authoritative verification

Offline validation must never claim:

- issuance
- existence
- ownership
- registration status
- account activity
- address existence
- phone reachability
- current mobile carrier

Implement only what the available evidence supports.

When evidence is incomplete, preserve the known limitation in documentation and tests rather than inventing stronger guarantees.

## Input rules

Validators accept `unknown` but valid identifiers must be primitive strings.

Do not implicitly:

- coerce values to strings
- trim whitespace
- remove punctuation
- remove separators
- translate Arabic/Persian numerals
- uppercase/lowercase values
- normalize data

Normalization must be explicit and separate.

Use ASCII digit checks `[0-9]`, not `\d`.

Reject:

- numbers
- bigint
- boxed strings
- arrays
- objects
- Arabic-Indic digits
- Persian digits
- full-width digits
- hidden Unicode characters

unless the specific function explicitly documents otherwise.

## Validation result model

Use the shared project result types rather than creating validator-specific result structures unless required.

Expected error categories:

```ts
type ValidationErrorCode =
  | "REQUIRED"
  | "INVALID_TYPE"
  | "INVALID_LENGTH"
  | "INVALID_FORMAT"
  | "INVALID_PREFIX"
  | "INVALID_CHECKSUM";
```

Preserve deterministic error precedence.

Do not use hidden trimming when determining `REQUIRED`.

For example:

```ts
validateX("");
```

may return `REQUIRED`.

But:

```ts
validateX(" ");
```

must fail according to the validator's canonical format rules.

## Public API

Prefer explicit APIs such as:

```ts
isSaudiIban();
validateSaudiIban();

isNationalId();
validateNationalId();
```

Avoid vague APIs such as:

```ts
validate(value, type);
```

Boolean helpers should remain thin wrappers around detailed validators when both exist.

Do not change public API names or behavior without explicit task requirements.

## Normalizers

Normalizers must:

- be explicit
- be deterministic
- return canonical output
- never perform authoritative verification
- reject unsupported representations rather than guessing

Normalizers should be idempotent:

```ts
normalize(normalize(value)) === normalize(value);
```

whenever normalization succeeds.

## TypeScript

Maintain strict TypeScript.

Prefer:

- narrow public types
- simple discriminated unions
- readonly values where useful
- type inference over unnecessary annotations

Avoid:

- `any`
- unsafe casts
- unnecessary generics
- branded types unless there is a demonstrated need
- non-null assertions unless logically guaranteed

Do not weaken compiler settings to make code pass.

## Package design

This is an npm package.

Preserve:

- tree-shakeability
- side-effect-free modules
- TypeScript declarations
- clean package exports
- minimal published contents
- compatibility with the project's supported Node versions
- browser compatibility when naturally possible

Do not import Node-only APIs unless necessary.

Do not add a bundler unless the existing technical design requires it.

## Tests

Validation correctness is more important than implementation cleverness.

Every validator must test relevant cases from:

- valid canonical input
- empty input
- wrong type
- wrong length
- wrong prefix
- illegal characters
- leading/trailing whitespace
- separators
- Arabic-Indic digits
- Persian digits
- full-width digits
- Unicode lookalikes
- invisible Unicode characters
- near-valid mutations
- extremely long input

Checksum validators must test:

- valid checksum
- invalid checksum
- mutation of relevant positions
- boundary/check-digit cases

Normalizers must test:

- every supported input representation
- unsupported representations
- idempotence

Do not weaken or delete tests simply to make a change pass.

Prefer explicit table-driven tests when many cases share behavior.

## Performance and security

Validation code should be predictable and cheap.

Prefer O(1) or O(n) algorithms.

Avoid:

- catastrophic-backtracking regexes
- unbounded recursion
- unnecessary allocation
- parsing identifiers as JavaScript numbers
- checksum implementations susceptible to numeric precision loss

For large invalid inputs, reject as early as practical.

## Evidence-based rules

Saudi-specific business rules should be traceable to the project's requirements/source documentation.

Do not silently change:

- identifier lengths
- prefixes
- checksum algorithms
- numbering ranges
- address formats
- tax formats

based only on memory or another package.

If a task requires changing a Saudi validation rule and the repository does not contain sufficient evidence, flag it in the implementation summary instead of guessing.

## Comments

Prefer self-explanatory code.

Add comments only when they explain:

- a non-obvious algorithm
- an external specification requirement
- an important limitation
- why an apparently simpler implementation is incorrect

Do not narrate obvious code.

## Commands and verification

After changing code, run the smallest relevant verification first.

For validator changes, prefer targeted tests.

Before considering the task complete, run the project's required checks when practical, typically:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Use the actual scripts defined in `package.json`; do not invent commands.

For package/release-related work also use:

```bash
npm pack --dry-run
```

when relevant.

If a command fails because of unrelated pre-existing issues, report that clearly and do not modify unrelated code to hide the failure.

## Completion criteria

A task is complete only when:

- requested behavior is implemented
- relevant tests exist
- relevant tests pass
- TypeScript still passes
- public behavior has not unintentionally changed
- no runtime dependency was added without approval
- no unrelated files were changed

At the end, report only:

1. what changed
2. tests/checks run and their result
3. any unresolved issue or assumption

Keep the summary concise.

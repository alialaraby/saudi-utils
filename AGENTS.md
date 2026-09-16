# Saudi Utils — Codex Instructions

## Project purpose

Build a production-quality npm package for Saudi-specific validation and normalization utilities.

Primary product goals:

- maximum correctness
- zero runtime dependencies where reasonably possible
- very small package size
- strong TypeScript developer experience
- exhaustive edge-case coverage
- evidence-based Saudi validation rules
- clean, readable implementation
- professional open-source/npm quality

This repository is also a **portfolio project**.

Every meaningful implementation decision should help demonstrate strong software-engineering judgment to:

- senior engineers
- engineering managers
- technical recruiters
- open-source contributors
- npm users

The GitHub repository should visibly demonstrate:

- thoughtful architecture
- clean TypeScript
- strong tests
- disciplined Git usage
- meaningful commits
- clear PRs
- CI quality gates
- documentation quality
- explicit technical decisions
- secure and maintainable implementation
- professional npm-package practices

Do not optimize for artificial GitHub activity. Prefer a small number of high-quality commits, branches, issues, and PRs over activity generated only for appearance.

This is an npm library, not an application.

## Git and GitHub workflow

For meaningful implementation work:

1. Inspect the current branch and repository status before changing anything.
2. Do not implement significant features directly on the default branch.
3. Create a focused branch for the current task.
4. Choose a concise, descriptive branch name following normal Git conventions.

Examples:

```text
feat/identity-validation
feat/saudi-iban
test/identity-edge-cases
docs/validation-evidence
ci/package-quality
fix/iban-normalization
```

5. Keep commits focused and independently understandable.
6. Choose commit messages using Conventional Commits where appropriate.

Examples:

```text
feat(identity): add Saudi national ID validation
test(identity): cover checksum mutations
feat(banking): add Saudi IBAN normalization
docs(identity): document checksum evidence
fix(telecom): reject unsupported phone prefix
ci: add package validation workflow
```

Avoid:

```text
update
changes
fix stuff
phase 3
work
final
```

7. Do not combine unrelated changes into one commit.
8. Before creating a PR, run the relevant tests and package checks.
9. Push the branch and create a PR when the phase/task is complete.
10. Never merge automatically unless explicitly requested.

Codex may choose:

- branch names
- commit boundaries
- commit messages
- Git commands
- PR title
- PR description

but they must follow these repository rules.

## Pull requests

Each meaningful phase or feature should normally produce one focused PR.

PR titles should clearly describe the engineering outcome.

Good:

```text
feat(identity): add Saudi identity validators
feat(banking): implement Saudi IBAN validation
test(identity): harden identity validation edge cases
```

PR descriptions should stay concise but include:

### What

What capability was added or changed.

### Why

The requirement or technical reason.

### Implementation

Important engineering decisions only.

### Validation

Tests and checks executed.

### Limitations

Known evidence gaps or intentionally unsupported behavior, when relevant.

Do not generate verbose PR descriptions merely for appearance.

## Portfolio-quality decisions

When multiple technically valid implementations exist, prefer the one that best demonstrates:

- correctness
- maintainability
- simplicity
- clear engineering reasoning
- testing discipline
- npm-library knowledge

Do not introduce unnecessary patterns solely to make the project look more sophisticated.

Senior engineering quality should be visible through good decisions, not architecture complexity.

## Repository hygiene

Keep the repository professional.

Do not commit:

- generated temporary files
- debug output
- editor-specific noise
- credentials
- secrets
- `.env` files
- unnecessary build artifacts
- experimental files not belonging to the implementation

Keep `.gitignore` accurate.

Do not rewrite published Git history unless explicitly requested.

Do not force-push unless explicitly required.

## GitHub Issues and roadmap

When the repository already uses GitHub Issues, keep implementation tasks aligned with them.

For substantial work:

- create or reference a focused issue where useful
- connect the PR to the issue
- keep scope consistent with the roadmap
- do not implement future phases accidentally

Do not create trivial issues merely to increase visible activity.

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
{
  "dependencies": {}
}
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
- Git history for the task is clean and meaningful
- the phase is ready for a focused PR

At the end, report only:

1. what changed
2. branch used
3. commits created
4. tests/checks run and their result
5. PR created or ready to create
6. any unresolved issue or assumption

Keep the summary concise.

# Contributing

Contributions that improve correctness, evidence quality, tests, or documentation are welcome.
Keep changes focused: this is a small validation library, not an application or generic validation
framework.

## Setup

Node.js 22 or newer and npm are required.

```bash
git clone https://github.com/alialaraby/saudi-utils.git
cd saudi-utils
npm ci
npm run check
```

Use a concise branch name such as `fix/iban-normalization` or `docs/evidence-update`. Do not include
generated temporary files, credentials, `.env` files, or unrelated refactors.

## Checks

Run the smallest relevant test while developing. Before submitting a pull request, run:

```bash
npm run docs:check
npm run check
```

`npm run check` covers formatting, linting, strict TypeScript, the full coverage suite, and the
build. `npm run docs:check` builds declarations, typechecks and executes the quick-start example,
and validates local Markdown links.

## Validation-rule and evidence changes

Do not add or change a Saudi validation rule from memory, inference, or another package alone.
Every rule change must:

1. identify an authoritative or approved public source;
2. state the exact offline rule and whether a checksum is applied;
3. state what success does not prove and any evidence gap;
4. update [the requirements](docs/requirements.md) and [evidence register](docs/evidence.md) before
   changing accepted behavior;
5. add focused valid, invalid, Unicode, mutation, and boundary tests as applicable.

If evidence cannot support the proposed behavior, open an evidence-update issue instead of
implementing an unverified rule. Structural and checksum validation must never be described as
authoritative verification.

## Pull requests

Prefer one coherent outcome per pull request. Explain what changed, why it is justified, important
implementation decisions, checks run, and known limitations. Call out public API, dependency, and
accepted-value changes explicitly. Use Conventional Commit messages where appropriate, for
example:

```text
fix(telecom): reject unsupported phone prefix
docs(identity): clarify checksum evidence
test(banking): cover IBAN checksum mutations
```

Do not add runtime dependencies without prior approval. Avoid framework adapters, broad
abstractions, generated activity, and future-roadmap work unrelated to the pull request.

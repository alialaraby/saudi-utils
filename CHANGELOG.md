# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
intends to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.3.0 - 2026-09-27

### Added

- `canonicalizeIban`, `canonicalizePhoneNumber`, and `canonicalizeShortAddress` expose transform-only `string | null` candidates. Validation remains a separate step.
- Packed-artifact runtime checks for Node 18, 20, 22, and 24.

### Changed

- Restored compatibility with the v0.1.0 normalization contracts: `normalizeIban` and `normalizeShortAddress` again return `null` for invalid candidates, and `normalizePhoneNumber` again returns a kind-tagged `NormalizedSaudiPhone | null`. These APIs remain available but are deprecated in favor of the new canonicalizers.
- `normalizeAndValidateIban`, `normalizeAndValidatePhoneNumber`, and `normalizeAndValidateShortAddress` use canonicalization followed by detailed validation.
- Declared Node.js 18 or newer for runtime consumers. Development and package checks continue on newer supported tooling versions.
- Updated README and API guidance for the canonicalization and compatibility APIs.

## 0.2.1 - 2026-09-27

### Changed

- Updated the npm README, API examples, requirements, roadmap, and release metadata to reflect the published API. No runtime behavior changed.

## 0.2.0

### Added

- Improved public TSDoc for published declarations and IDE IntelliSense.
- `validateXDetailed` functions for all validators, with deterministic error codes and messages.
- `normalizeAndValidateIban`, `normalizeAndValidatePhoneNumber`, and `normalizeAndValidateShortAddress` for conversion followed by detailed validation.

### Changed

- **Breaking:** Standalone normalizers now consistently return `string | null`. In particular, `normalizePhoneNumber` no longer returns a kind-tagged object; phone kind is available from a successful `normalizeAndValidatePhoneNumber` result. Normalizers produce candidates without asserting domain validity.

## 0.1.0 - 2026-09-17

### Added

- Project documentation for installation, public APIs, validation evidence, contribution,
  security reporting, and issue and pull-request workflows.

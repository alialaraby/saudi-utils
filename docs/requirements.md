# Saudi Utils — V1 Requirements

**Status:** Approved implementation baseline

**Research date:** 16 September 2026

**Product:** A zero-runtime-dependency TypeScript/JavaScript npm library for offline validation of common Saudi identifiers and data formats

## 1. Product decision

V1 includes every high-value validator requested for identity, banking, business/tax, telecom, and National Address data. Uneven public evidence is handled through explicit confidence levels rather than by silently excluding important APIs.

The package validates the strongest defensible offline claim for each value. It never presents structural or checksum validation as proof of issuance, ownership, registration, activity, account existence, address existence, or phone reachability.

## 2. Evidence model

Documentation assigns one of these levels to every validator:

```ts
export type ValidationEvidence =
  | "official-checksum"
  | "official-structural"
  | "official-structural-community-checksum"
  | "best-known-structural";
```

`ValidationEvidence` is a documentation classification, not a field returned by every runtime call.

| Level                                    | Meaning                                                                                                                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `official-checksum`                      | Both the structure and checksum method are supported by normative or authoritative material.                                                                                      |
| `official-structural`                    | Public authoritative material supports the structure; no extra checksum is claimed.                                                                                               |
| `official-structural-community-checksum` | An authority supports the structure and existence of a check digit, while the formula is supported by public ecosystem implementations rather than a published normative formula. |
| `best-known-structural`                  | The API implements the most consistently documented offline structure available and calls out ambiguity.                                                                          |

Each public API entry in the README and evidence document must state what is checked, what is not checked, whether a checksum is applied, its evidence level, its sources, and known limitations.

## 3. Shared behavior

### 3.1 Strict inputs

- Validators accept `unknown` and regard only primitive JavaScript strings as valid inputs.
- There is no coercion, trimming, case folding, separator removal, or numeral conversion inside validators.
- Numbers, bigint, boxed strings, arrays, objects with `toString`, `NaN`, and `Infinity` are invalid types.
- All numeric grammar uses ASCII `[0-9]`, never `\d`.
- Arabic-Indic, Persian, full-width, and mixed-script digits are rejected.
- Identifiers retain leading zeroes and are never represented as JavaScript numbers.
- Explicit normalizers are separate APIs and document their exact accepted transformations. They return a mechanically canonical candidate even when domain validation fails; `null` means the representation cannot produce a meaningful candidate.

Example:

```ts
isSaudiIban("SA39 1500 0000 1234 5678 9012"); // false
normalizeIban("SA39 1500 0000 1234 5678 9012"); // canonical value or null
```

### 3.2 Result model

```ts
export type ValidationErrorCode =
  | "REQUIRED"
  | "INVALID_TYPE"
  | "INVALID_LENGTH"
  | "INVALID_FORMAT"
  | "INVALID_PREFIX"
  | "INVALID_CHECKSUM";

export type ValidationResult =
  { valid: true; value: string } | { valid: false; code: ValidationErrorCode };
```

No branded string types are included in V1.

### 3.3 Deterministic error precedence

Validators return the first applicable error in this order:

1. `REQUIRED` — `undefined`, `null`, or `""`.
2. `INVALID_TYPE` — every other non-string.
3. `INVALID_LENGTH` — wrong canonical length after type handling.
4. `INVALID_FORMAT` — illegal characters or layout.
5. `INVALID_PREFIX` — structurally plausible value for another country, service, or identifier kind.
6. `INVALID_CHECKSUM` — structure passes but the checksum fails.

`" "` is not required; it fails the canonical format or length rule. Boolean helpers are thin wrappers around detailed validators and return `false` for every failure.

## 4. V1 validation contracts

### 4.1 Identity

#### National ID

- **APIs:** `isNationalId`, `validateNationalId`
- **Canonical input:** exactly 10 ASCII digits, first digit `1`.
- **Checksum:** alternating-double checksum used by the Saudi ID implementation referenced through the DGA open-source ecosystem; digits are processed left to right, doubled in alternating positions, and decimal digits summed; total must be divisible by 10.
- **Evidence:** `official-structural-community-checksum`.
- **Does not prove:** issuance, holder identity, citizenship status, validity, or expiry.
- **Known limitation:** the public SAMA rulebook describes the verification digit but does not publish its formula.

#### Iqama / Resident ID

- **APIs:** `isIqama`, `validateIqama`
- **Canonical input:** exactly 10 ASCII digits, first digit `2`.
- **Checksum:** the same alternating-double rule as National ID.
- **Evidence:** `official-structural-community-checksum`.
- **Does not prove:** issuance, residency, sponsorship, holder, status, or expiry.
- **Known limitation:** same public-formula gap as National ID.

#### Generic Saudi person ID and type detection

- **APIs:** `isSaudiId`, `validateSaudiId`, `getSaudiIdType`
- **Canonical input:** a value accepted by National ID or Iqama validation.
- **Return type:** `getSaudiIdType(value)` returns `"national-id"`, `"iqama"`, or `null`.
- **Evidence:** `official-structural-community-checksum`.
- **Rule:** composition only; do not duplicate the checksum implementation.

#### Border ID

- **APIs:** `isBorderId`, `validateBorderId`
- **Canonical input:** exactly 10 ASCII digits beginning with `3` or `4`; it does not guess a checksum.
- **Evidence:** `best-known-structural`.
- **Does not prove:** that the number is a Border ID in every government workflow, issuance, person, visa, entry, or status.
- **Known limitation:** Jawazat public guidance supports prefixes `3`/`4`, while no complete public normative schema or checksum was found. This contract must be highlighted as provisional and reviewed on every major release.

### 4.2 Banking

#### Saudi IBAN

- **APIs:** `isSaudiIban`, `validateSaudiIban`, `normalizeIban`, `formatIban`
- **Canonical input:** exactly 24 uppercase ASCII alphanumeric characters; `SA`; two check digits; two numeric bank-identifier digits; then 18 uppercase ASCII alphanumeric characters.
- **Checksum:** ISO 13616 / MOD-97-10, computed incrementally without converting the complete numeric expansion to a JavaScript number.
- **Evidence:** `official-checksum`.
- **Normalizer:** strings only; remove ASCII spaces (`U+0020`) and uppercase ASCII `a-z`; reject all other separators, NBSP, invisible characters, and non-strings. Return a non-empty canonical candidate even when its country code, length, or checksum is invalid; return `null` for unsupported representations or no alphanumeric content.
- **Formatter:** accept only a valid canonical Saudi IBAN and group from the left in blocks of four with one ASCII space; return string or `null`.
- **Does not prove:** bank-code allocation, account existence, ownership, state, or ability to receive funds.

### 4.3 Business and tax

#### VAT Registration Number

- **APIs:** `isVatNumber`, `validateVatNumber`
- **Canonical input:** exactly 15 ASCII digits; first and last digits are `3` (`^3[0-9]{13}3$`).
- **Checksum:** none claimed.
- **Evidence:** `official-structural`.
- **Does not prove:** VAT registration, taxpayer identity, activity, or status.

#### ZATCA TIN

- **APIs:** `isTin`, `validateTin`
- **Canonical input:** exactly 10 ASCII digits.
- **Checksum:** none claimed.
- **Evidence:** `best-known-structural`.
- **Does not prove:** taxpayer registration, tax type, taxpayer identity, or current status.
- **Known limitation:** official materials distinguish TIN from the 15-digit VAT Registration Number but do not expose a single public normative checksum or richer offline grammar. `isTin` must never alias `isVatNumber`.

#### Unified National Number for non-governmental establishments

- **APIs:** `isUnifiedNationalNumber`, `validateUnifiedNationalNumber`
- **Canonical input:** exactly 10 ASCII digits beginning with `7` (`^7[0-9]{9}$`). Do not incorrectly require `700`.
- **Checksum:** none claimed.
- **Evidence:** `official-structural`.
- **Does not prove:** establishment existence, legal form, commercial status, activity, or current registration.

#### Commercial Registration

- **APIs:** `isCommercialRegistration`, `validateCommercialRegistration`
- **Canonical input:** legacy CR number: exactly 10 ASCII digits.
- **Checksum:** none claimed.
- **Evidence:** `best-known-structural`.
- **Naming/transition rule:** V1 documents this API as validation of the legacy 10-digit CR representation. It is not an alias for the current Unified National Number; callers validating an establishment's current lifecycle identity should use `isUnifiedNationalNumber`.
- **Does not prove:** the register exists, its legal status, region, establishment identity, or whether the legacy number remains active.
- **Known limitation:** the current Commercial Register system and Unified National Number transition make a broad `isCommercialRegistration` claim easy to overstate. README examples must say “legacy structural format.”

### 4.4 Telecom

The CST National Numbering Plan is the structural basis. Number portability prohibits current-carrier inference.

#### Mobile

- **APIs:** `isMobileNumber`, `validateMobileNumber`
- **Canonical inputs:** national `^05[0-9]{8}$` or E.164 `^\+9665[0-9]{8}$`.
- **Evidence:** `official-structural`.
- **Does not prove:** allocation, activation, subscriber, reachability, or carrier.

#### Landline

- **APIs:** `isLandlineNumber`, `validateLandlineNumber`
- **Canonical inputs:** national `^01[123467][0-9]{7}$` or E.164 `^\+9661[123467][0-9]{7}$`.
- **Valid geographic codes:** `011`, `012`, `013`, `014`, `016`, `017`; reject `010`, `015`, `018`, and `019`.
- **Evidence:** `official-structural`.
- **Does not prove:** allocation, exact geography, activation, or reachability.

#### Toll-free

- **APIs:** `isTollFreeNumber`, `validateTollFreeNumber`
- **Canonical input:** national `^800[0-9]{7}$` only.
- **Evidence:** `official-structural`.
- **Rule:** do not accept or synthesize an international representation in V1; `9200` unified-access numbers are not toll-free.

#### Phone normalization

- **API:** `normalizePhoneNumber`
- **Mobile/landline accepted representations:** unseparated ASCII-digit national form, `+966...`, `966...`, or `00966...`.
- **Toll-free accepted representation:** national `800...` only; validation checks its length.
- **Rejected:** punctuation, internal or external whitespace, extensions, Unicode digits, double country codes, and malformed prefixes.
- **Return type:**

```ts
export type NormalizedSaudiPhone =
  | { kind: "mobile" | "landline"; value: `+966${string}` }
  | { kind: "toll-free"; value: `800${string}` };
```

Return `NormalizedSaudiPhone | null`. The kind selects the relevant validator; the returned candidate may have an invalid prefix or length. `null` means the documented representation cannot be converted. Successful normalization is idempotent.

### 4.5 National Address

#### Component validators

| Component         | APIs                                             | Canonical rule                                        | Evidence              |
| ----------------- | ------------------------------------------------ | ----------------------------------------------------- | --------------------- |
| Postal code       | `isPostalCode`, `validatePostalCode`             | Exactly 5 ASCII digits                                | `official-structural` |
| Building number   | `isBuildingNumber`, `validateBuildingNumber`     | Exactly 4 ASCII digits                                | `official-structural` |
| Additional number | `isAdditionalNumber`, `validateAdditionalNumber` | Exactly 4 ASCII digits                                | `official-structural` |
| Short Address     | `isShortAddress`, `validateShortAddress`         | Exactly 4 uppercase ASCII letters then 4 ASCII digits | `official-structural` |

Leading zeroes are preserved. Structural validation does not establish allocation or existence.

`normalizeShortAddress` accepts strings only, uppercases ASCII `a-z`, and removes at most one ASCII space between the four-letter and four-digit groups. It rejects hyphens, multiple/internal spaces, Unicode letters, invisible characters, and non-strings. It returns the canonical candidate even when the digit count is invalid, or `null` for unsupported representations, and is idempotent.

#### National Address object

- **API:** `validateNationalAddress`
- **Input:** `unknown`.
- **Required own properties:** `buildingNumber`, `street`, `district`, `city`, `postalCode`, `additionalNumber`.
- **Shape:** a non-null, non-array object. Required properties must be own data properties; inherited values do not satisfy the contract. Extra own properties are ignored so DTOs can carry unrelated application data.
- **Numeric components:** primitive strings passing their named validators.
- **Text components:** primitive, non-empty strings. They are not trimmed, normalized, or restricted to Arabic/Latin characters.
- **Return:** the common string result cannot represent an object, so V1 defines one justified specialization:

```ts
export type NationalAddress = {
  buildingNumber: string;
  street: string;
  district: string;
  city: string;
  postalCode: string;
  additionalNumber: string;
};

export type NationalAddressValidationResult =
  { valid: true; value: NationalAddress } | { valid: false; code: ValidationErrorCode };

export function validateNationalAddress(value: unknown): NationalAddressValidationResult;
```

Failure precedence is: shared required/type checks, missing required own property as `REQUIRED`, wrong property type as `INVALID_TYPE`, then component validators in the property order shown above. It does not validate relationships, spelling, municipality, geolocation, or existence.

## 5. Complete public API

```ts
// shared types
ValidationErrorCode;
ValidationResult;
ValidationEvidence;
NormalizedSaudiPhone;
NationalAddress;
NationalAddressValidationResult;

// identity
isNationalId;
validateNationalId;
isIqama;
validateIqama;
isSaudiId;
validateSaudiId;
getSaudiIdType;
isBorderId;
validateBorderId;

// banking
isSaudiIban;
validateSaudiIban;
normalizeIban;
formatIban;

// business/tax
isVatNumber;
validateVatNumber;
isTin;
validateTin;
isUnifiedNationalNumber;
validateUnifiedNationalNumber;
isCommercialRegistration;
validateCommercialRegistration;

// telecom
isMobileNumber;
validateMobileNumber;
isLandlineNumber;
validateLandlineNumber;
isTollFreeNumber;
validateTollFreeNumber;
normalizePhoneNumber;

// National Address
isPostalCode;
validatePostalCode;
isBuildingNumber;
validateBuildingNumber;
isAdditionalNumber;
validateAdditionalNumber;
isShortAddress;
validateShortAddress;
normalizeShortAddress;
validateNationalAddress;
```

Every name above is a named root export. V1 has no default export.

## 6. npm package architecture

### 6.1 Runtime and modules

- ESM-only package with `"type": "module"`.
- Node.js `>=22`; CI covers supported Node 22, 24, and 26 lines while available.
- Browser-compatible wherever ESM and standard JavaScript are supported; runtime code must not import Node built-ins or touch process/global state.
- TypeScript compiled by `tsc`; no V1 bundler.
- `target: "ES2022"`, `module: "NodeNext"`, `moduleResolution: "NodeNext"`, strict checking, declarations, declaration maps, and source maps.
- No CommonJS build. A future CJS entry requires demonstrated consumer demand and a semver-reviewed design.

### 6.2 Exports and tree shaking

- One root export only: `import { isSaudiIban } from "<package-name>"`.
- No `/banking`, `/identity`, or other subpaths in V1. Pure named ESM exports plus `"sideEffects": false` support tree shaking without multiplying public entry points.
- `exports` maps `types` and `import` for `.`. `main` and `types` may mirror the root for older tooling, while `exports` remains authoritative.
- Source modules have no import-time work, mutation, logging, I/O, or environment detection.

Illustrative metadata:

```json
{
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "engines": { "node": ">=22" }
}
```

### 6.3 Package name and metadata

- Final unscoped project and npm package name: `saudi-utils`.
- Phase 1 verifies `saudi-utils` availability with the npm registry before committing metadata. Search-engine absence is not proof. If unavailable, stop for an explicit scope/name decision rather than inventing a misleading variation.
- Metadata includes a concise description, focused keywords, maintainers, MIT license, repository, bugs, homepage, and `publishConfig.access: "public"`.
- Suggested keywords: `saudi`, `saudi-arabia`, `ksa`, `validation`, `national-id`, `iqama`, `iban`, `zatca`, `national-address`, `typescript`.
- Publish only `dist/`, `README.md`, `LICENSE`, and necessary root metadata.
- Record file list and sizes from `npm pack --dry-run --json`; test the real packed `.tgz` in consumer fixtures.

### 6.4 Versioning and publishing

- Semantic Versioning applies. Breaking public contracts are major; backward-compatible APIs are minor; fixes and non-contract evidence clarifications are patch.
- A rule change that changes accepted/rejected values must be prominent and at least minor, or major when consumers could reasonably depend on the former result.
- Use npm trusted publishing from GitHub Actions with OIDC and provenance; do not store a long-lived npm token when trusted publishing is available.
- Releases originate from a protected GitHub environment after CI and packed-artifact inspection.
- `CHANGELOG.md` follows Keep a Changelog; GitHub Releases mirror version notes.
- First release is `0.1.0`. `1.0.0` requires a declared stable API and completed evidence audit.

## 7. Implementation constraints

- `dependencies` is empty.
- Dev dependencies may cover TypeScript, Vitest/V8 coverage, ESLint, typescript-eslint, Prettier, package validation, and optional property testing.
- Prefer small domain modules and tiny internal helpers such as ASCII checks, shared input failure handling, identity checksum, and `mod97`.
- Do not create a configurable validator factory unless repetition proves a concrete benefit.
- Do not use NestJS, dependency injection, decorators, framework adapters, layered application architecture, schema engines, validation frameworks, or a generic `validate(value, type)` API.
- Avoid classes unless a later objective requirement cannot be expressed clearly with functions.

## 8. Test and quality contract

Target 100% branch coverage for deterministic runtime code wherever realistically achievable. Any exclusion must be justified in configuration and review.

Every validator inherits cases for:

- `undefined`, `null`, empty string, whitespace-only, and leading/trailing whitespace.
- number, bigint, `NaN`, `Infinity`, boolean, symbol, function, object, array, and boxed string.
- spaces, hyphens, underscores, slashes, dots, and parentheses.
- NBSP, zero-width characters, bidi controls, line breaks, and tabs.
- Arabic-Indic, Persian, full-width, and mixed-script digits.
- wrong length, wrong prefix, near-valid mutations, and leading-zero preservation.
- a 1 MiB input to demonstrate fast rejection and no pathological regex behavior.
- boolean/detailed-validator equivalence, input immutability, and determinism.

Algorithm suites additionally cover:

- **Identity:** reference vectors, checksum digit zero, valid/invalid checksum, every-position mutation, and National ID/Iqama cross-type behavior.
- **IBAN:** official Saudi example, independent BigInt test oracle, checksum/BBAN mutations, valid non-Saudi rejection, and no production numeric-precision dependence.
- **Business/tax:** boundary prefixes, overlap across TIN/CR/Unified National Number/VAT, and evidence-limited behavior.
- **Phones:** every landline area code and adjacent invalid code, national/E.164 forms, every normalization prefix, malformed country codes, toll-free national-only behavior, and no carrier API.
- **Address:** canonical casing, malformed Unicode, leading zeroes, own-property completeness, arrays, null prototypes, inherited values, extra fields, accessors/prototype-pollution keys, and deterministic component precedence.
- **Packaging:** ESM import, TypeScript consumption, declarations, export encapsulation, metadata, and install/import from the packed tarball.

Regexes must be anchored, simple, and free from nested ambiguous repetition. Runtime must remain constant or linear in input length and reject obviously wrong lengths before checksum work.

## 9. Explicitly out of scope

- Live registry lookup or authoritative verification.
- APIs named `exists*`, `verify*`, `isRegistered*`, or `isActive*` without a real authoritative lookup.
- Mobile-carrier inference, IBAN bank allocation, address geocoding, or cross-field allocation checks.
- Hidden Arabic/Persian numeral conversion.
- Framework integrations, server applications, and generic configurable validation engines.

## 10. Evidence register

| Domain                  | Evidence                                                                                                                                                                                                                                        | Supported claim                                                                                                                             | Limitation                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| National ID / Iqama     | [SAMA Appendix C](https://rulebook.sama.gov.sa/en/appendix-c-0); [DGA OSS listing](https://oss.dga.gov.sa/en/products/2efb54db4afb400e8d663688954baa31); [linked implementation](https://github.com/alhazmy13/Saudi-ID-Validator)               | Ten digits, `1`/`2` prefixes, verification digit, ecosystem checksum                                                                        | Public normative page omits formula                   |
| Border ID               | [Absher border-number query](https://www.absher.sa/wps/vanityurl/en/individuals/querybordernumber); [Jawazat public guidance](https://x.com/AljawazatKSA/status/943878092858318848)                                                             | Border Number is a Jawazat record; public guidance states it starts with `3` or `4`; operational references consistently describe 10 digits | No complete normative schema or checksum is published |
| Saudi IBAN              | [SWIFT IBAN Registry](https://www.swift.com/sites/default/files/files/iban-registry_3.pdf); [SAMA printed format](https://rulebook.sama.gov.sa/en/printed-iban-account-formats)                                                                 | Saudi structure, MOD-97-10, printed grouping                                                                                                | No live bank/account verification                     |
| VAT                     | [ZATCA XML Implementation Standard v1.2](https://zatca.gov.sa/ar/E-Invoicing/SystemsDevelopers/Documents/20230519_ZATCA_Electronic_Invoice_XML_Implementation_Standard_%20vTrack.pdf)                                                           | 15 digits, first/last `3`                                                                                                                   | No offline status or extra checksum                   |
| TIN                     | [ZATCA taxpayer services](https://zatca.gov.sa/en/eServices/Pages/eServices-048.aspx); [e-invoicing resolution](https://zatca.gov.sa/en/E-Invoicing/Introduction/LawsAndRegulations/Documents/E-Invoicing%20Implementation%20Resolution_EN.pdf) | TIN exists and is distinct from VAT in relevant models                                                                                      | Public normative format detail is limited             |
| Unified National Number | [SAMA approval of Unified Number starting with 7](https://www.rulebook.sama.gov.sa/en/approval-unified-number-starting-7-issued-national-information-center-serve-unified-number-non)                                                           | Ten digits starting with `7`                                                                                                                | No existence/status proof                             |
| Commercial Registration | [Ministry of Commerce law transition](https://mc.gov.sa/en/mediacenter/News/Pages/18-09-24-01.aspx); [inquiry service](https://mc.gov.sa/en/eservices/Pages/ServiceDetails.aspx?sID=91)                                                         | Transition context and authoritative lookup                                                                                                 | Legacy 10-digit rule is best-known structural only    |
| Phone numbering         | [CST National Numbering Plan](https://www.cst.gov.sa/en/regulations-and-licenses/regulations/Document-1573); [CST numbering overview](https://www.cst.gov.sa/en/about/Numbering)                                                                | Mobile, landline, freephone structure and portability                                                                                       | No subscriber, carrier, or reachability proof         |
| National Address        | [SPL National Address](https://splonline.com.sa/en/door-step/)                                                                                                                                                                                  | Components and Short Address representation                                                                                                 | No allocation, existence, or relationship proof       |

## 11. Public developer experience requirements

### 11.1 Public API documentation

- Every exported public function and type must have useful TSDoc/JSDoc that appears in published TypeScript declarations and IDE hover/IntelliSense.
- Function documentation must explain its purpose, parameters and their types, return type and success/failure semantics, and important validation or normalization behavior. Include useful examples where they clarify accepted inputs, output, or limitations.
- Type documentation must explain the meaning of its variants and fields where the type alone is insufficient.
- Documentation must match actual behavior and evidence limits without repeating implementation details unnecessarily.

### 11.2 Combined normalization and validation

- For each value with both a public normalizer and validator, provide one public operation that normalizes the input first, validates the normalized value, and returns that canonical value on success.
- Use one consistent naming and API convention across supported domains. Preserve the existing `normalizeX()` and `validateX()` contracts.
- Compose existing normalization and validation primitives where practical; do not duplicate domain rules.
- Failed normalization or validation must return a deterministic failure compatible with the shared result/error model. Do not treat a failed normalizer as proof of a more specific validation error than the available evidence supports.

### 11.3 Detailed validation failures

- Provide an opt-in public validation result that explains failures with a structured `ValidationErrorCode` and a concise, human-readable message. Use the existing error categories (`REQUIRED`, `INVALID_TYPE`, `INVALID_LENGTH`, `INVALID_FORMAT`, `INVALID_PREFIX`, `INVALID_CHECKSUM`) where applicable.
- Preserve existing boolean `isX()` APIs and structured `validateX()` APIs and their behavior. New message-bearing results and combined operations should use a consistent success/failure model where practical.
- Error selection and messages must be deterministic, suitable for backend and frontend consumers, and must not expose implementation-specific or internal errors.
- Preserve the established error precedence and do not introduce Saudi validation rules beyond those documented and evidenced here.

### 11.4 Compatibility and quality

- Add these capabilities without breaking existing public APIs. Keep zero runtime dependencies, strict TypeScript, and the existing test and package quality standards.
- Before implementation, resolve the public naming of combined operations, the message-bearing result type, and how normalization failures map to error codes, including the object-valued phone normalizer.

## 12. Approval baseline

This document is the implementation baseline. Any change to accepted representations, public exports, error precedence, evidence level, or limitations must first update this specification and receive review.

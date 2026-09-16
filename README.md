# Saudi Utils

`saudi-utils` is a small, strict TypeScript library for offline validation and explicit
normalization of common Saudi identity, banking, business, telecom, and National Address data.
It provides deterministic errors, evidence-labelled rules, and no runtime dependencies.

> [!IMPORTANT]
> A successful result proves only the documented offline structure and, where stated, checksum.
> It does **not** prove issuance, ownership, existence, activity, registration, account status,
> address existence, phone reachability, or any current authoritative status.

## Installation

```bash
npm install saudi-utils
```

## Quick start

`saudi-utils` is ESM-only, supports Node.js 22 and newer, and includes TypeScript declarations.
There is no default export.

```ts
import { formatIban, getSaudiIdType, normalizeIban, validateSaudiIban } from "saudi-utils";

getSaudiIdType("1000000008"); // "national-id" (synthetic checksum-valid example)

const iban = normalizeIban("sa03 8000 0000 6080 1016 7519");
// "SA0380000000608010167519"

validateSaudiIban(iban);
// { valid: true, value: "SA0380000000608010167519" }

formatIban(iban);
// "SA03 8000 0000 6080 1016 7519"
```

The package exposes one side-effect-free ESM root. Pure named exports and
`"sideEffects": false` support tree shaking. Runtime code uses standard JavaScript and has zero
runtime dependencies.

## Validation and normalization

Validators are deliberately strict. They accept `unknown`, but only primitive strings can be
valid identifiers. They do not trim, coerce, remove punctuation, change case, or translate
Unicode numerals. Canonical numeric values use ASCII digits and preserve leading zeroes.

Explicit normalizers accept only their documented variants:

- `normalizeIban` removes ASCII spaces, uppercases ASCII letters, then validates the result.
- `normalizePhoneNumber` accepts specific unseparated Saudi national and country-code forms.
- `normalizeShortAddress` uppercases ASCII letters and removes at most one permitted ASCII space.

All return `null` for unsupported or invalid input and are idempotent after success.
`formatIban` is only a formatter: it accepts a valid, canonical Saudi IBAN and returns `null` for
lowercase, spaced, invalid, or non-Saudi input. Call `normalizeIban` first when normalization is
required.

Detailed validators return the shared result:

```ts
type ValidationResult =
  { valid: true; value: string } | { valid: false; code: ValidationErrorCode };
```

Errors use deterministic precedence:

1. `REQUIRED`
2. `INVALID_TYPE`
3. `INVALID_LENGTH`
4. `INVALID_FORMAT`
5. `INVALID_PREFIX`
6. `INVALID_CHECKSUM`

`undefined`, `null`, and `""` are required failures. Whitespace is not silently treated as empty.
Boolean `is*` helpers are thin wrappers around their detailed validators.

## API reference

Every public value is a named root export. See [the detailed API reference](docs/api.md) for exact
signatures, accepted representations, normalization rules, and return behavior.

| Domain           | Public exports                                                                                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity         | `isNationalId`, `validateNationalId`, `isIqama`, `validateIqama`, `isSaudiId`, `validateSaudiId`, `getSaudiIdType`, `isBorderId`, `validateBorderId`                                                                               |
| Banking          | `isSaudiIban`, `validateSaudiIban`, `normalizeIban`, `formatIban`                                                                                                                                                                  |
| Business and tax | `isVatNumber`, `validateVatNumber`, `isTin`, `validateTin`, `isUnifiedNationalNumber`, `validateUnifiedNationalNumber`, `isCommercialRegistration`, `validateCommercialRegistration`                                               |
| Telecom          | `isMobileNumber`, `validateMobileNumber`, `isLandlineNumber`, `validateLandlineNumber`, `isTollFreeNumber`, `validateTollFreeNumber`, `normalizePhoneNumber`                                                                       |
| National Address | `isPostalCode`, `validatePostalCode`, `isBuildingNumber`, `validateBuildingNumber`, `isAdditionalNumber`, `validateAdditionalNumber`, `isShortAddress`, `validateShortAddress`, `normalizeShortAddress`, `validateNationalAddress` |
| Types            | `ValidationErrorCode`, `ValidationResult`, `ValidationEvidence`, `NormalizedSaudiPhone`, `NationalAddress`, `NationalAddressValidationResult`                                                                                      |

### Canonical representations

| Value                          | Accepted canonical representation                                                        | Checksum                    |
| ------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------- |
| National ID                    | 10 ASCII digits beginning with `1`                                                       | Alternating-double checksum |
| Iqama                          | 10 ASCII digits beginning with `2`                                                       | Alternating-double checksum |
| Border ID                      | 10 ASCII digits beginning with `3` or `4`                                                | None                        |
| Saudi IBAN                     | 24 uppercase ASCII alphanumeric characters beginning with `SA`; positions 3–6 are digits | ISO 13616 MOD-97-10         |
| VAT Registration Number        | 15 ASCII digits beginning and ending with `3`                                            | None                        |
| TIN                            | 10 ASCII digits                                                                          | None                        |
| Unified National Number        | 10 ASCII digits beginning with `7`                                                       | None                        |
| Legacy Commercial Registration | 10 ASCII digits                                                                          | None                        |
| Mobile                         | `05XXXXXXXX` or `+9665XXXXXXXX`                                                          | None                        |
| Landline                       | National or `+966` form using `011`, `012`, `013`, `014`, `016`, or `017`                | None                        |
| Toll-free                      | National `800XXXXXXX` only                                                               | None                        |
| Postal code                    | 5 ASCII digits                                                                           | None                        |
| Building/additional number     | 4 ASCII digits                                                                           | None                        |
| Short Address                  | 4 uppercase ASCII letters followed by 4 ASCII digits                                     | None                        |

### Evidence levels and important limitations

Rules are classified as `official-checksum`, `official-structural`,
`official-structural-community-checksum`, or `best-known-structural`. The complete source and
limitation register is in [docs/evidence.md](docs/evidence.md).

- **Border ID is provisional:** only the best-known 10-digit structure and `3`/`4` prefixes are
  checked. No checksum or complete public normative schema is claimed.
- **TIN is structural only:** any 10 ASCII digits pass. No checksum or richer authoritative offline
  grammar is claimed.
- **Commercial Registration means the legacy structural format:** the API checks only a 10-digit
  legacy representation. It is not current registry verification and is not an alias for the
  Unified National Number.
- Phone prefixes describe numbering structure, not the subscriber's current carrier. Number
  portability makes current-carrier inference invalid.

## Examples

The values labelled synthetic below demonstrate offline rules only; they are not presented as
issued identifiers. The repository's [typechecked quick-start fixture](examples/quick-start.ts)
also executes its expected results.

### Identity

```ts
import { getSaudiIdType, validateBorderId, validateNationalId } from "saudi-utils";

validateNationalId("1000000008"); // { valid: true, value: "1000000008" } (synthetic)
getSaudiIdType("1000000008"); // "national-id"
validateBorderId("3000000000"); // structural success only (synthetic)
```

### IBAN

```ts
import { formatIban, normalizeIban } from "saudi-utils";

const iban = normalizeIban("sa03 8000 0000 6080 1016 7519");
formatIban(iban); // "SA03 8000 0000 6080 1016 7519"
formatIban("sa03 8000 0000 6080 1016 7519"); // null: formatting does not normalize
```

### Business and tax

```ts
import { validateTin, validateUnifiedNationalNumber, validateVatNumber } from "saudi-utils";

validateVatNumber("300000000000003").valid; // true: structural result
validateTin("0123456789").valid; // true: best-known structural result
validateUnifiedNationalNumber("7123456789").valid; // true: structural result
```

### Telecom

```ts
import { normalizePhoneNumber, validateMobileNumber } from "saudi-utils";

validateMobileNumber("0501234567").valid; // true: no reachability or carrier claim
normalizePhoneNumber("0501234567");
// { kind: "mobile", value: "+966501234567" }
```

### National Address

```ts
import { normalizeShortAddress, validateNationalAddress } from "saudi-utils";

normalizeShortAddress("abcd 0123"); // "ABCD0123"

validateNationalAddress({
  buildingNumber: "0123",
  street: "King Fahd Road",
  district: "Al Olaya",
  city: "Riyadh",
  postalCode: "01234",
  additionalNumber: "0000",
  applicationField: "ignored",
});
// Success returns a fresh object containing only the six required fields.
```

`validateNationalAddress` requires those six own data properties, ignores extra properties, does
not invoke accessors, and returns a fresh object containing only required fields. Its specialized
`NationalAddressValidationResult` returns a `NationalAddress` object on success. Text fields must
be non-empty primitive strings but are not trimmed or linguistically restricted; cross-field and
address-existence checks are outside the contract.

## Development

```bash
npm ci
npm run docs:check
npm run check
```

Available focused commands are `npm test`, `npm run test:coverage`, `npm run typecheck`,
`npm run lint`, `npm run format:check`, and `npm run build`. Node.js 22 or newer is required.

## Project policies

- [Validation evidence](docs/evidence.md)
- [API reference](docs/api.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [MIT License](LICENSE)

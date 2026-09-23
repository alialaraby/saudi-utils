# API reference

All APIs are named exports from `saudi-utils`. The package has no default export or public subpath
exports. Validators accept `unknown`; they never coerce input. Unless noted, detailed validators
return [`ValidationResult`](#shared-types), and boolean helpers return whether that detailed result
is valid.

Passing any API is an offline result only. See [validation evidence](evidence.md) for the exact
claim and source behind each rule.

## Explained validation

Each existing `validateX(value)` keeps its `{ valid, value | code }` result, and each `isX(value)`
keeps its boolean behavior. For every `validateX`, an opt-in `validateXDetailed(value)` export
returns `DetailedValidationResult<T>`:

```ts
type DetailedValidationResult<T = string> =
  | { valid: true; value: T }
  | { valid: false; code: ValidationErrorCode; message: string; normalizedValue?: string };
```

`T` is `NationalAddress` for `validateNationalAddressDetailed` and `string` for the other
validators. Detailed validation uses the same rules and error precedence as `validateX`; it does
not normalize inputs. The code identifies the failure category, and the concise message identifies
the domain and reason. Messages are English display text; consumers should branch on `code`, not
parse `message`. Validation is offline and does not establish issuance, existence, or status.

```ts
validateSaudiIbanDetailed("SA0380000000608010167518");
// { valid: false, code: "INVALID_CHECKSUM", message: "Saudi IBAN has an invalid checksum." }
```

## Normalize and validate together

`normalizeAndValidateIban`, `normalizeAndValidateShortAddress`, and
`normalizeAndValidatePhoneNumber` accept the same representations as their standalone normalizers,
then apply the corresponding detailed validators. They return `DetailedValidationResult<string>`
for IBAN and Short Address, or `DetailedValidationResult<NormalizedSaudiPhone>` for phones. A
successful result contains the canonical value. A failed result contains a code and message; when
conversion produced a short, safe candidate, `normalizedValue` contains that candidate for
inspection. Unsupported representations produce `INVALID_FORMAT` without guessing a more
specific rule. Missing and non-string inputs produce `REQUIRED` and `INVALID_TYPE` respectively.

```ts
normalizeAndValidateIban("sa03 8000 0000 6080 1016 7519");
// { valid: true, value: "SA0380000000608010167519" }
```

## Identity

| Export               | Signature                                              | Contract                                                                              |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `validateNationalId` | `(value: unknown) => ValidationResult`                 | Exactly 10 ASCII digits, prefix `1`, valid alternating-double checksum.               |
| `isNationalId`       | `(value: unknown) => boolean`                          | Boolean National ID validation.                                                       |
| `validateIqama`      | `(value: unknown) => ValidationResult`                 | Exactly 10 ASCII digits, prefix `2`, valid alternating-double checksum.               |
| `isIqama`            | `(value: unknown) => boolean`                          | Boolean Iqama validation.                                                             |
| `validateSaudiId`    | `(value: unknown) => ValidationResult`                 | Accepts a valid National ID or Iqama; preserves the canonical value.                  |
| `isSaudiId`          | `(value: unknown) => boolean`                          | Boolean National ID-or-Iqama validation.                                              |
| `getSaudiIdType`     | `(value: unknown) => "national-id" \| "iqama" \| null` | Classifies a checksum-valid National ID or Iqama; otherwise returns `null`.           |
| `validateBorderId`   | `(value: unknown) => ValidationResult`                 | Best-known structure: exactly 10 ASCII digits beginning with `3` or `4`; no checksum. |
| `isBorderId`         | `(value: unknown) => boolean`                          | Boolean structural Border ID validation.                                              |

National ID and Iqama checksum support comes from community implementation evidence linked by the
DGA ecosystem; the public normative source does not publish the formula. Border ID validation is
provisional and structural only.

## Banking

| Export              | Signature                              | Contract                                                                                                                                       |
| ------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `validateSaudiIban` | `(value: unknown) => ValidationResult` | Validates the canonical 24-character uppercase Saudi structure and MOD-97-10 checksum.                                                         |
| `isSaudiIban`       | `(value: unknown) => value is string`  | Boolean/type-guard form of Saudi IBAN validation.                                                                                              |
| `normalizeIban`     | `(value: unknown) => string \| null`   | For primitive strings, removes all ASCII spaces and uppercases ASCII `a-z`, then returns the canonical value only if it is a valid Saudi IBAN. |
| `formatIban`        | `(value: unknown) => string \| null`   | Groups a valid canonical Saudi IBAN from the left in blocks of four separated by ASCII spaces. It does not normalize first.                    |

Canonical Saudi IBAN layout is `SA`, two check digits, two numeric bank-identifier digits, then 18
uppercase ASCII alphanumeric characters. `normalizeIban` rejects non-ASCII whitespace, other
separators, Unicode numerals, invisible characters, non-strings, and values that remain invalid.
`formatIban` returns `null` for lowercase, already spaced, checksum-invalid, or non-Saudi input.

## Business and tax

| Export                           | Signature                              | Contract                                                                                   |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `validateVatNumber`              | `(value: unknown) => ValidationResult` | Exactly 15 ASCII digits beginning and ending with `3`; no checksum.                        |
| `isVatNumber`                    | `(value: unknown) => value is string`  | Boolean/type-guard VAT structure validation.                                               |
| `validateTin`                    | `(value: unknown) => ValidationResult` | Exactly 10 ASCII digits; best-known structure with no checksum.                            |
| `isTin`                          | `(value: unknown) => value is string`  | Boolean/type-guard TIN structure validation.                                               |
| `validateUnifiedNationalNumber`  | `(value: unknown) => ValidationResult` | Exactly 10 ASCII digits beginning with `7`; `700` is not required.                         |
| `isUnifiedNationalNumber`        | `(value: unknown) => value is string`  | Boolean/type-guard Unified National Number structure validation.                           |
| `validateCommercialRegistration` | `(value: unknown) => ValidationResult` | Exactly 10 ASCII digits in the legacy Commercial Registration representation; no checksum. |
| `isCommercialRegistration`       | `(value: unknown) => value is string`  | Boolean/type-guard legacy CR structure validation.                                         |

TIN and legacy Commercial Registration deliberately overlap because both documented offline
contracts accept any 10 ASCII digits. A Unified National Number can therefore also satisfy those
broader structural grammars. These APIs do not infer registry type or status.

## Telecom

| Export                   | Signature                                          | Contract                                                                                    |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `validateMobileNumber`   | `(value: unknown) => ValidationResult`             | National `05XXXXXXXX` or E.164 `+9665XXXXXXXX`.                                             |
| `isMobileNumber`         | `(value: unknown) => value is string`              | Boolean/type-guard mobile structure validation.                                             |
| `validateLandlineNumber` | `(value: unknown) => ValidationResult`             | National or E.164 form with geographic code `011`, `012`, `013`, `014`, `016`, or `017`.    |
| `isLandlineNumber`       | `(value: unknown) => value is string`              | Boolean/type-guard landline structure validation.                                           |
| `validateTollFreeNumber` | `(value: unknown) => ValidationResult`             | National `800XXXXXXX` only. International-looking forms and `9200` numbers are unsupported. |
| `isTollFreeNumber`       | `(value: unknown) => value is string`              | Boolean/type-guard toll-free structure validation.                                          |
| `normalizePhoneNumber`   | `(value: unknown) => NormalizedSaudiPhone \| null` | Normalizes and classifies one supported unseparated representation.                         |

For mobile and landline values, `normalizePhoneNumber` accepts canonical national, `+966`, `966`,
or `00966` form and returns canonical `+966...`. It accepts toll-free numbers only in canonical
national form and returns `800...`. It rejects whitespace, punctuation, extensions, Unicode
digits, malformed/doubled country codes, and unsupported service prefixes.

No telecom API proves allocation, activation, subscriber identity, reachability, or current
carrier. Prefixes cannot identify the current carrier because numbers are portable.

## National Address

| Export                     | Signature                                             | Contract                                                                                    |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `validatePostalCode`       | `(value: unknown) => ValidationResult`                | Exactly 5 ASCII digits.                                                                     |
| `isPostalCode`             | `(value: unknown) => value is string`                 | Boolean/type-guard postal-code structure validation.                                        |
| `validateBuildingNumber`   | `(value: unknown) => ValidationResult`                | Exactly 4 ASCII digits.                                                                     |
| `isBuildingNumber`         | `(value: unknown) => value is string`                 | Boolean/type-guard building-number structure validation.                                    |
| `validateAdditionalNumber` | `(value: unknown) => ValidationResult`                | Exactly 4 ASCII digits.                                                                     |
| `isAdditionalNumber`       | `(value: unknown) => value is string`                 | Boolean/type-guard additional-number structure validation.                                  |
| `validateShortAddress`     | `(value: unknown) => ValidationResult`                | Exactly 4 uppercase ASCII letters followed by 4 ASCII digits.                               |
| `isShortAddress`           | `(value: unknown) => value is string`                 | Boolean/type-guard Short Address structure validation.                                      |
| `normalizeShortAddress`    | `(value: unknown) => string \| null`                  | Uppercases four ASCII letters and removes zero or one ASCII space before four ASCII digits. |
| `validateNationalAddress`  | `(value: unknown) => NationalAddressValidationResult` | Validates the six-field National Address object contract below.                             |

`normalizeShortAddress` rejects leading/trailing whitespace, multiple or internal spaces, hyphens,
Unicode letters or digits, invisible characters, and non-strings.

`validateNationalAddress` requires a non-null, non-array object with these own data properties:

```ts
type NationalAddress = {
  buildingNumber: string;
  street: string;
  district: string;
  city: string;
  postalCode: string;
  additionalNumber: string;
};
```

Missing, empty, inherited, or accessor properties fail as `REQUIRED`. All six properties must be
primitive strings. The building, postal, and additional numbers must pass their component
validators. Street, district, and city must be non-empty but are not trimmed, normalized, or
restricted by language. Extra properties are ignored and not copied. A successful result contains
a fresh plain object with only the six required fields.

## Shared types

### `ValidationErrorCode`

```ts
type ValidationErrorCode =
  | "REQUIRED"
  | "INVALID_TYPE"
  | "INVALID_LENGTH"
  | "INVALID_FORMAT"
  | "INVALID_PREFIX"
  | "INVALID_CHECKSUM";
```

### `ValidationResult`

```ts
type ValidationResult =
  { valid: true; value: string } | { valid: false; code: ValidationErrorCode };
```

### `ValidationEvidence`

```ts
type ValidationEvidence =
  | "official-checksum"
  | "official-structural"
  | "official-structural-community-checksum"
  | "best-known-structural";
```

This is a documentation classification, not a property returned by validators.

### `NormalizedSaudiPhone`

```ts
type NormalizedSaudiPhone =
  | { kind: "mobile" | "landline"; value: `+966${string}` }
  | { kind: "toll-free"; value: `800${string}` };
```

### `NationalAddress` and `NationalAddressValidationResult`

```ts
type NationalAddress = {
  buildingNumber: string;
  street: string;
  district: string;
  city: string;
  postalCode: string;
  additionalNumber: string;
};

type NationalAddressValidationResult =
  { valid: true; value: NationalAddress } | { valid: false; code: ValidationErrorCode };
```

This specialization preserves the shared error model while returning an object rather than a
string on success.

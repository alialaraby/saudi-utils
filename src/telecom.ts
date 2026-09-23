import { isAsciiDigits } from "./internal/ascii.js";
import { checkStringInput } from "./internal/input.js";
import type { NormalizedSaudiPhone, ValidationResult } from "./types.js";

const NATIONAL_PHONE_LENGTH = 10;
const E164_PHONE_LENGTH = 13;

function validateNationalOrE164Format(value: string): boolean {
  if (value.length === NATIONAL_PHONE_LENGTH) {
    return isAsciiDigits(value);
  }

  return value.startsWith("+") && isAsciiDigits(value.slice(1));
}

function hasE164SaudiPrefix(value: string): value is `+966${string}` {
  return value.startsWith("+966");
}

/**
 * Validates a Saudi mobile number in national 05... or +9665... form.
 *
 * Requires ASCII digits and no separators; does not verify allocation, reachability, or carrier.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
export function validateMobileNumber(value: unknown): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== NATIONAL_PHONE_LENGTH && input.value.length !== E164_PHONE_LENGTH) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (!validateNationalOrE164Format(input.value)) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  if (
    (input.value.length === NATIONAL_PHONE_LENGTH && !input.value.startsWith("05")) ||
    (input.value.length === E164_PHONE_LENGTH && !input.value.startsWith("+9665"))
  ) {
    return { valid: false, code: "INVALID_PREFIX" };
  }

  return { valid: true, value: input.value };
}

/**
 * Checks the national or +966 Saudi mobile number structure.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isMobileNumber(value: unknown): value is string {
  return validateMobileNumber(value).valid;
}

/**
 * Validates a Saudi landline in national 01... or +9661... form with a supported area code.
 *
 * Requires ASCII digits and no separators; does not verify allocation or reachability.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
export function validateLandlineNumber(value: unknown): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== NATIONAL_PHONE_LENGTH && input.value.length !== E164_PHONE_LENGTH) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (!validateNationalOrE164Format(input.value)) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  const nationalNumber =
    input.value.length === NATIONAL_PHONE_LENGTH ? input.value : `0${input.value.slice(4)}`;

  if (!/^01[123467]/.test(nationalNumber)) {
    return { valid: false, code: "INVALID_PREFIX" };
  }

  return { valid: true, value: input.value };
}

/**
 * Checks the national or +966 Saudi landline structure and area code.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isLandlineNumber(value: unknown): value is string {
  return validateLandlineNumber(value).valid;
}

/**
 * Validates a Saudi toll-free number in 10-digit national 800... form only.
 *
 * International forms and 9200 numbers are not accepted; reachability is not verified.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
export function validateTollFreeNumber(value: unknown): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== NATIONAL_PHONE_LENGTH) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (!isAsciiDigits(input.value)) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  if (!input.value.startsWith("800")) {
    return { valid: false, code: "INVALID_PREFIX" };
  }

  return { valid: true, value: input.value };
}

/**
 * Checks the national 800... Saudi toll-free structure only.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isTollFreeNumber(value: unknown): value is string {
  return validateTollFreeNumber(value).valid;
}

/**
 * Normalizes a supported phone representation without validating its prefix or length.
 *
 * Mobile and landline accept national, +966, 966, or 00966 forms and return +966 form. Toll-free accepts national 800 form only. Whitespace, punctuation, extensions, and Unicode digits are rejected.
 *
 * @param value - Unknown input; only unseparated primitive ASCII strings in supported forms are accepted.
 * @returns A kind-tagged canonical candidate, even when its prefix or length is invalid; null when the representation cannot be converted. The kind selects the corresponding validator and does not assert validity.
 */
export function normalizePhoneNumber(value: unknown): NormalizedSaudiPhone | null {
  const canonical = normalizePhoneNumberInput(value);

  if (canonical === null) {
    return null;
  }

  if (canonical.startsWith("800")) {
    return { kind: "toll-free", value: `800${canonical.slice(3)}` };
  }

  const e164: `+966${string}` = `+966${canonical.slice(4)}`;

  if (canonical.startsWith("+9661")) {
    return { kind: "landline", value: e164 };
  }

  return { kind: "mobile", value: e164 };
}

/** @internal Produces a candidate without claiming that the phone number is valid. */
export function normalizePhoneNumberInput(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  if (value.startsWith("800")) {
    return isAsciiDigits(value) ? value : null;
  }

  const national = hasE164SaudiPrefix(value)
    ? value.slice(4)
    : value.startsWith("00966")
      ? value.slice(5)
      : value.startsWith("966")
        ? value.slice(3)
        : value.startsWith("0")
          ? value.slice(1)
          : null;

  return national !== null &&
    national !== "" &&
    isAsciiDigits(national) &&
    !national.startsWith("0") &&
    !national.startsWith("966") &&
    !national.startsWith("800")
    ? `+966${national}`
    : null;
}

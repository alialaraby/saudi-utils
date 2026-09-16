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

export function isMobileNumber(value: unknown): value is string {
  return validateMobileNumber(value).valid;
}

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

export function isLandlineNumber(value: unknown): value is string {
  return validateLandlineNumber(value).valid;
}

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

export function isTollFreeNumber(value: unknown): value is string {
  return validateTollFreeNumber(value).valid;
}

export function normalizePhoneNumber(value: unknown): NormalizedSaudiPhone | null {
  if (typeof value !== "string") {
    return null;
  }

  if (validateTollFreeNumber(value).valid) {
    return { kind: "toll-free", value: `800${value.slice(3)}` };
  }

  let canonical: `+966${string}`;

  if (hasE164SaudiPrefix(value)) {
    canonical = value;
  } else if (value.startsWith("00966")) {
    canonical = `+966${value.slice(5)}`;
  } else if (value.startsWith("966")) {
    canonical = `+966${value.slice(3)}`;
  } else if (value.startsWith("0")) {
    canonical = `+966${value.slice(1)}`;
  } else {
    return null;
  }

  if (validateMobileNumber(canonical).valid) {
    return { kind: "mobile", value: canonical };
  }

  if (validateLandlineNumber(canonical).valid) {
    return { kind: "landline", value: canonical };
  }

  return null;
}

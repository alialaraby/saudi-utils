import { isAsciiDigits } from "./internal/ascii.js";
import { checkStringInput } from "./internal/input.js";
import type { ValidationResult } from "./types.js";

export function validateVatNumber(value: unknown): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== 15) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (!isAsciiDigits(input.value)) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  if (!input.value.startsWith("3") || !input.value.endsWith("3")) {
    return { valid: false, code: "INVALID_PREFIX" };
  }

  return { valid: true, value: input.value };
}

export function isVatNumber(value: unknown): value is string {
  return validateVatNumber(value).valid;
}

export function validateTin(value: unknown): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== 10) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (!isAsciiDigits(input.value)) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  return { valid: true, value: input.value };
}

export function isTin(value: unknown): value is string {
  return validateTin(value).valid;
}

export function validateUnifiedNationalNumber(value: unknown): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== 10) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (!isAsciiDigits(input.value)) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  if (!input.value.startsWith("7")) {
    return { valid: false, code: "INVALID_PREFIX" };
  }

  return { valid: true, value: input.value };
}

export function isUnifiedNationalNumber(value: unknown): value is string {
  return validateUnifiedNationalNumber(value).valid;
}

export function validateCommercialRegistration(value: unknown): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== 10) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (!isAsciiDigits(input.value)) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  return { valid: true, value: input.value };
}

export function isCommercialRegistration(value: unknown): value is string {
  return validateCommercialRegistration(value).valid;
}

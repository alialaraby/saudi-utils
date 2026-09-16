import { isAsciiDigits } from "./internal/ascii.js";
import { hasValidSaudiIdentityChecksum } from "./internal/identity-checksum.js";
import { checkStringInput } from "./internal/input.js";
import type { ValidationResult } from "./types.js";

export function validateNationalId(value: unknown): ValidationResult {
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

  if (!input.value.startsWith("1")) {
    return { valid: false, code: "INVALID_PREFIX" };
  }

  if (!hasValidSaudiIdentityChecksum(input.value)) {
    return { valid: false, code: "INVALID_CHECKSUM" };
  }

  return { valid: true, value: input.value };
}

export function isNationalId(value: unknown): boolean {
  return validateNationalId(value).valid;
}

export function validateIqama(value: unknown): ValidationResult {
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

  if (!input.value.startsWith("2")) {
    return { valid: false, code: "INVALID_PREFIX" };
  }

  if (!hasValidSaudiIdentityChecksum(input.value)) {
    return { valid: false, code: "INVALID_CHECKSUM" };
  }

  return { valid: true, value: input.value };
}

export function isIqama(value: unknown): boolean {
  return validateIqama(value).valid;
}

export function validateSaudiId(value: unknown): ValidationResult {
  const nationalId = validateNationalId(value);

  if (nationalId.valid || nationalId.code !== "INVALID_PREFIX") {
    return nationalId;
  }

  return validateIqama(value);
}

export function isSaudiId(value: unknown): boolean {
  return validateSaudiId(value).valid;
}

export function getSaudiIdType(value: unknown): "national-id" | "iqama" | null {
  const result = validateSaudiId(value);

  if (!result.valid) {
    return null;
  }

  return result.value.startsWith("1") ? "national-id" : "iqama";
}

export function validateBorderId(value: unknown): ValidationResult {
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

  if (!input.value.startsWith("3") && !input.value.startsWith("4")) {
    return { valid: false, code: "INVALID_PREFIX" };
  }

  return { valid: true, value: input.value };
}

export function isBorderId(value: unknown): boolean {
  return validateBorderId(value).valid;
}

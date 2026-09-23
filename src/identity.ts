import { isAsciiDigits } from "./internal/ascii.js";
import { hasValidSaudiIdentityChecksum } from "./internal/identity-checksum.js";
import { checkStringInput } from "./internal/input.js";
import type { ValidationResult } from "./types.js";

/**
 * Validates a Saudi national ID: 10 ASCII digits starting with 1 and a valid check digit.
 *
 * Does not establish issuance, holder identity, or current status.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
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

/**
 * Checks a Saudi national ID using the same structural and checksum rules as validateNationalId.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isNationalId(value: unknown): boolean {
  return validateNationalId(value).valid;
}

/**
 * Validates an Iqama: 10 ASCII digits starting with 2 and a valid check digit.
 *
 * Does not establish issuance, residency, or current status.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
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

/**
 * Checks an Iqama using the same structural and checksum rules as validateIqama.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isIqama(value: unknown): boolean {
  return validateIqama(value).valid;
}

/**
 * Validates either a Saudi national ID or Iqama, including its check digit.
 *
 * Accepts only 10 ASCII digits starting with 1 or 2.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
export function validateSaudiId(value: unknown): ValidationResult {
  const nationalId = validateNationalId(value);

  if (nationalId.valid || nationalId.code !== "INVALID_PREFIX") {
    return nationalId;
  }

  return validateIqama(value);
}

/**
 * Checks whether a value is a valid national ID or Iqama.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isSaudiId(value: unknown): boolean {
  return validateSaudiId(value).valid;
}

/**
 * Identifies a valid Saudi national ID or Iqama.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns "national-id" or "iqama" for a valid value; null otherwise.
 */
export function getSaudiIdType(value: unknown): "national-id" | "iqama" | null {
  const result = validateSaudiId(value);

  if (!result.valid) {
    return null;
  }

  return result.value.startsWith("1") ? "national-id" : "iqama";
}

/**
 * Checks the provisional Border ID structure: 10 ASCII digits starting with 3 or 4.
 *
 * No checksum, issuance, or status is verified.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
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

/**
 * Checks the provisional Border ID structure without claiming issuance or status.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isBorderId(value: unknown): boolean {
  return validateBorderId(value).valid;
}

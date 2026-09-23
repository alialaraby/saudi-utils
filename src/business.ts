import { isAsciiDigits } from "./internal/ascii.js";
import { checkStringInput } from "./internal/input.js";
import type { ValidationResult } from "./types.js";

/**
 * Validates the 15-digit Saudi VAT number structure, including leading and trailing 3.
 *
 * This is structural only; no checksum or registration status is verified.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
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

/**
 * Checks the structural Saudi VAT number format without verifying registration.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isVatNumber(value: unknown): value is string {
  return validateVatNumber(value).valid;
}

/**
 * Validates the best-known ZATCA TIN structure: exactly 10 ASCII digits.
 *
 * No checksum or tax registration status is verified.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
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

/**
 * Checks the 10-digit ZATCA TIN structure without verifying registration.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isTin(value: unknown): value is string {
  return validateTin(value).valid;
}

/**
 * Validates a non-governmental establishment Unified National Number: 10 ASCII digits starting with 7.
 *
 * No checksum, existence, or registration status is verified.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
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

/**
 * Checks the Unified National Number structure without verifying the establishment.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isUnifiedNationalNumber(value: unknown): value is string {
  return validateUnifiedNationalNumber(value).valid;
}

/**
 * Validates the legacy Commercial Registration structure: exactly 10 ASCII digits.
 *
 * This does not validate a current Unified National Number or confirm registration.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
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

/**
 * Checks the legacy 10-digit Commercial Registration structure only.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isCommercialRegistration(value: unknown): value is string {
  return validateCommercialRegistration(value).valid;
}

import { isAsciiDigits, isUppercaseAsciiAlphanumeric } from "./internal/ascii.js";
import { checkStringInput } from "./internal/input.js";
import { mod97 } from "./internal/mod97.js";
import type { ValidationResult } from "./types.js";

const UPPERCASE_ASCII_LETTERS = /^[A-Z]{2}$/;

function hasValidIbanChecksum(value: string): boolean {
  const rearranged = `${value.slice(4)}${value.slice(0, 4)}`;
  let expanded = "";

  for (const character of rearranged) {
    const code = character.charCodeAt(0);
    expanded += code >= 65 && code <= 90 ? String(code - 55) : character;
  }

  return mod97(expanded) === 1;
}

/**
 * Validates a canonical Saudi IBAN: 24 uppercase ASCII characters, SA country code, numeric check/bank digits, and MOD-97 checksum.
 *
 * Spaces and lowercase letters are not accepted here; use normalizeIban explicitly.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
export function validateSaudiIban(value: unknown): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== 24) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (
    !isUppercaseAsciiAlphanumeric(input.value) ||
    !UPPERCASE_ASCII_LETTERS.test(input.value.slice(0, 2)) ||
    !isAsciiDigits(input.value.slice(2, 6))
  ) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  if (!input.value.startsWith("SA")) {
    return { valid: false, code: "INVALID_PREFIX" };
  }

  if (!hasValidIbanChecksum(input.value)) {
    return { valid: false, code: "INVALID_CHECKSUM" };
  }

  return { valid: true, value: input.value };
}

/**
 * Checks the canonical Saudi IBAN structure and MOD-97 checksum.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isSaudiIban(value: unknown): value is string {
  return validateSaudiIban(value).valid;
}

/**
 * Converts a Saudi IBAN to validated canonical form.
 *
 * Removes ASCII spaces and uppercases ASCII letters. Other separators and Unicode digits are rejected.
 *
 * @param value - Unknown input; only a primitive string is accepted.
 * @returns The uppercase, unspaced 24-character IBAN when valid; null otherwise.
 *
 * @example
 * normalizeIban("sa39 1500 0000 1234 5678 9012"); // "SA3915000000123456789012"
 */
export function normalizeIban(value: unknown): string | null {
  const normalized = normalizeIbanInput(value);
  return normalized !== null && isSaudiIban(normalized) ? normalized : null;
}

/** @internal Produces a candidate without claiming that the IBAN is valid. */
export function normalizeIbanInput(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  let normalized = "";

  for (const character of value) {
    if (character === " ") {
      continue;
    }

    const code = character.charCodeAt(0);

    if (code >= 97 && code <= 122) {
      normalized += String.fromCharCode(code - 32);
    } else if ((code >= 65 && code <= 90) || (code >= 48 && code <= 57)) {
      normalized += character;
    } else {
      return null;
    }
  }

  return normalized;
}

/**
 * Groups a valid canonical Saudi IBAN into six blocks of four characters.
 *
 * @param value - Unknown input; must be a valid, uppercase, unspaced Saudi IBAN string.
 * @returns The grouped IBAN with ASCII spaces, or null for invalid input.
 */
export function formatIban(value: unknown): string | null {
  if (!isSaudiIban(value)) {
    return null;
  }

  return `${value.slice(0, 4)} ${value.slice(4, 8)} ${value.slice(8, 12)} ${value.slice(12, 16)} ${value.slice(16, 20)} ${value.slice(20, 24)}`;
}

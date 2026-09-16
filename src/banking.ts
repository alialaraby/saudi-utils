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

export function isSaudiIban(value: unknown): value is string {
  return validateSaudiIban(value).valid;
}

export function normalizeIban(value: unknown): string | null {
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

  return isSaudiIban(normalized) ? normalized : null;
}

export function formatIban(value: unknown): string | null {
  if (!isSaudiIban(value)) {
    return null;
  }

  return `${value.slice(0, 4)} ${value.slice(4, 8)} ${value.slice(8, 12)} ${value.slice(12, 16)} ${value.slice(16, 20)} ${value.slice(20, 24)}`;
}

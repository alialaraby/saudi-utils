import { isAsciiDigits } from "./internal/ascii.js";
import { checkStringInput } from "./internal/input.js";
import type { NationalAddressValidationResult, ValidationResult } from "./types.js";

const ADDRESS_FIELDS = [
  "buildingNumber",
  "street",
  "district",
  "city",
  "postalCode",
  "additionalNumber",
] as const;

function validateFixedLengthDigits(value: unknown, length: number): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== length) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (!isAsciiDigits(input.value)) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  return { valid: true, value: input.value };
}

/**
 * Validates a five-digit Saudi National Address postal code.
 *
 * Checks ASCII digit structure only, not allocation or address existence.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
export function validatePostalCode(value: unknown): ValidationResult {
  return validateFixedLengthDigits(value, 5);
}

/**
 * Checks the five-digit Saudi postal code structure only.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isPostalCode(value: unknown): value is string {
  return validatePostalCode(value).valid;
}

/**
 * Validates a four-digit Saudi National Address building number.
 *
 * Checks ASCII digit structure only, not allocation or address existence.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
export function validateBuildingNumber(value: unknown): ValidationResult {
  return validateFixedLengthDigits(value, 4);
}

/**
 * Checks the four-digit Saudi building number structure only.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isBuildingNumber(value: unknown): value is string {
  return validateBuildingNumber(value).valid;
}

/**
 * Validates a four-digit Saudi National Address additional number.
 *
 * Checks ASCII digit structure only, not allocation or address existence.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
export function validateAdditionalNumber(value: unknown): ValidationResult {
  return validateFixedLengthDigits(value, 4);
}

/**
 * Checks the four-digit Saudi additional number structure only.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isAdditionalNumber(value: unknown): value is string {
  return validateAdditionalNumber(value).valid;
}

/**
 * Validates a canonical Saudi Short Address: four uppercase ASCII letters followed by four ASCII digits.
 *
 * Spaces and lowercase letters are not accepted here; use normalizeShortAddress explicitly.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns A result containing the unchanged string when valid, or the first applicable error code.
 */
export function validateShortAddress(value: unknown): ValidationResult {
  const input = checkStringInput(value);

  if (!input.valid) {
    return input;
  }

  if (input.value.length !== 8) {
    return { valid: false, code: "INVALID_LENGTH" };
  }

  if (!/^[A-Z]{4}[0-9]{4}$/.test(input.value)) {
    return { valid: false, code: "INVALID_FORMAT" };
  }

  return { valid: true, value: input.value };
}

/**
 * Checks the canonical eight-character Saudi Short Address structure.
 *
 * @param value - Unknown input; only a primitive string in the stated canonical format is accepted.
 * @returns True when the input satisfies the stated offline rules; false otherwise.
 */
export function isShortAddress(value: unknown): value is string {
  return validateShortAddress(value).valid;
}

/**
 * Converts a supported Short Address representation to canonical form without validating it.
 *
 * Uppercases ASCII letters and removes at most one ASCII space between the groups; rejects other separators and Unicode characters.
 *
 * @param value - Unknown input; only a primitive string is accepted.
 * @returns Four uppercase ASCII letters followed by the supplied ASCII digits, even when the digit count is invalid; null when the representation is unsupported.
 *
 * @example
 * normalizeShortAddress("abcd 1234"); // "ABCD1234"
 */
export function normalizeShortAddress(value: unknown): string | null {
  return normalizeShortAddressInput(value);
}

/** @internal Produces a candidate without claiming that the Short Address is valid. */
export function normalizeShortAddressInput(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  if (!/^[A-Za-z]{4} ?[0-9]*$/.test(value)) {
    return null;
  }

  return `${value.slice(0, 4).toUpperCase()}${value.slice(value[4] === " " ? 5 : 4)}`;
}

/**
 * Validates the required shape and component formats of a Saudi National Address object.
 *
 * All fields must be nonempty strings. Building and additional numbers must have four ASCII digits; postal code must have five. Street, district, and city have no further format check. Existence and field relationships are not verified.
 *
 * @param value - Unknown input; must be an object with own data properties for buildingNumber, street, district, city, postalCode, and additionalNumber.
 * @returns The copied address fields when valid, or the first applicable error code.
 */
export function validateNationalAddress(value: unknown): NationalAddressValidationResult {
  if (value === undefined || value === null || value === "") {
    return { valid: false, code: "REQUIRED" };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, code: "INVALID_TYPE" };
  }

  const fields: Partial<Record<(typeof ADDRESS_FIELDS)[number], unknown>> = {};

  for (const field of ADDRESS_FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);

    if (descriptor === undefined || !("value" in descriptor) || descriptor.value === "") {
      return { valid: false, code: "REQUIRED" };
    }

    fields[field] = descriptor.value;
  }

  const buildingNumber = fields.buildingNumber;
  const street = fields.street;
  const district = fields.district;
  const city = fields.city;
  const postalCode = fields.postalCode;
  const additionalNumber = fields.additionalNumber;

  if (
    typeof buildingNumber !== "string" ||
    typeof street !== "string" ||
    typeof district !== "string" ||
    typeof city !== "string" ||
    typeof postalCode !== "string" ||
    typeof additionalNumber !== "string"
  ) {
    return { valid: false, code: "INVALID_TYPE" };
  }

  const componentResults = [
    validateBuildingNumber(buildingNumber),
    validatePostalCode(postalCode),
    validateAdditionalNumber(additionalNumber),
  ];

  for (const result of componentResults) {
    if (!result.valid) {
      return result;
    }
  }

  return {
    valid: true,
    value: {
      buildingNumber,
      street,
      district,
      city,
      postalCode,
      additionalNumber,
    },
  };
}

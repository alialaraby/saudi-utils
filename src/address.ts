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

export function validatePostalCode(value: unknown): ValidationResult {
  return validateFixedLengthDigits(value, 5);
}

export function isPostalCode(value: unknown): value is string {
  return validatePostalCode(value).valid;
}

export function validateBuildingNumber(value: unknown): ValidationResult {
  return validateFixedLengthDigits(value, 4);
}

export function isBuildingNumber(value: unknown): value is string {
  return validateBuildingNumber(value).valid;
}

export function validateAdditionalNumber(value: unknown): ValidationResult {
  return validateFixedLengthDigits(value, 4);
}

export function isAdditionalNumber(value: unknown): value is string {
  return validateAdditionalNumber(value).valid;
}

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

export function isShortAddress(value: unknown): value is string {
  return validateShortAddress(value).valid;
}

export function normalizeShortAddress(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  if (!/^[A-Za-z]{4} ?[0-9]{4}$/.test(value)) {
    return null;
  }

  return `${value.slice(0, 4).toUpperCase()}${value.slice(-4)}`;
}

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

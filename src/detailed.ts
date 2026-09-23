import type { DetailedValidationResult, NationalAddress, ValidationErrorCode } from "./types.js";
import {
  validateNationalId,
  validateIqama,
  validateSaudiId,
  validateBorderId,
} from "./identity.js";
import { validateSaudiIban } from "./banking.js";
import {
  validateVatNumber,
  validateTin,
  validateUnifiedNationalNumber,
  validateCommercialRegistration,
} from "./business.js";
import { validateMobileNumber, validateLandlineNumber, validateTollFreeNumber } from "./telecom.js";
import {
  validatePostalCode,
  validateBuildingNumber,
  validateAdditionalNumber,
  validateShortAddress,
  validateNationalAddress,
} from "./address.js";

const REASONS: Record<ValidationErrorCode, string> = {
  REQUIRED: "is required.",
  INVALID_TYPE: "has an invalid type.",
  INVALID_LENGTH: "has an invalid length.",
  INVALID_FORMAT: "has an invalid format.",
  INVALID_PREFIX: "has an invalid prefix.",
  INVALID_CHECKSUM: "has an invalid checksum.",
};

function explain<T>(
  result: { valid: true; value: T } | { valid: false; code: ValidationErrorCode },
  label: string,
): DetailedValidationResult<T> {
  if (result.valid) {
    return { valid: true, value: result.value };
  }
  return { valid: false, code: result.code, message: `${label} ${REASONS[result.code]}` };
}

/**
 * Validates a national ID and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateNationalIdDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateNationalId(value), "National ID");
}

/**
 * Validates an Iqama and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateIqamaDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateIqama(value), "Iqama");
}

/**
 * Validates a Saudi person ID and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateSaudiIdDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateSaudiId(value), "Saudi person ID");
}

/**
 * Validates a Border ID and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateBorderIdDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateBorderId(value), "Border ID");
}

/**
 * Validates a Saudi IBAN and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateSaudiIbanDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateSaudiIban(value), "Saudi IBAN");
}

/**
 * Validates a VAT number and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateVatNumberDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateVatNumber(value), "VAT number");
}

/**
 * Validates a TIN and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateTinDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateTin(value), "TIN");
}

/**
 * Validates a Unified National Number and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateUnifiedNationalNumberDetailed(
  value: unknown,
): DetailedValidationResult<string> {
  return explain(validateUnifiedNationalNumber(value), "Unified National Number");
}

/**
 * Validates a legacy Commercial Registration number and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateCommercialRegistrationDetailed(
  value: unknown,
): DetailedValidationResult<string> {
  return explain(validateCommercialRegistration(value), "Legacy Commercial Registration number");
}

/**
 * Validates a mobile number and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateMobileNumberDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateMobileNumber(value), "Mobile number");
}

/**
 * Validates a landline number and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateLandlineNumberDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateLandlineNumber(value), "Landline number");
}

/**
 * Validates a toll-free number and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateTollFreeNumberDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateTollFreeNumber(value), "Toll-free number");
}

/**
 * Validates a postal code and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validatePostalCodeDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validatePostalCode(value), "Postal code");
}

/**
 * Validates a building number and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateBuildingNumberDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateBuildingNumber(value), "Building number");
}

/**
 * Validates an additional number and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateAdditionalNumberDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateAdditionalNumber(value), "Additional number");
}

/**
 * Validates a Short Address and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateShortAddressDetailed(value: unknown): DetailedValidationResult<string> {
  return explain(validateShortAddress(value), "Short Address");
}

/**
 * Validates a National Address and explains the first failure without changing the canonical input.
 * @param value - Input to check; only the documented canonical representation is accepted.
 * @returns The unchanged validated value, or a code and message for the first failure.
 */
export function validateNationalAddressDetailed(
  value: unknown,
): DetailedValidationResult<NationalAddress> {
  return explain(validateNationalAddress(value), "National Address");
}

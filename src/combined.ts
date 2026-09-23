import { normalizeShortAddressInput } from "./address.js";
import { normalizeIbanInput } from "./banking.js";
import {
  validateLandlineNumberDetailed,
  validateMobileNumberDetailed,
  validateSaudiIbanDetailed,
  validateShortAddressDetailed,
  validateTollFreeNumberDetailed,
} from "./detailed.js";
import { normalizePhoneNumberInput } from "./telecom.js";
import type {
  DetailedValidationResult,
  NormalizedSaudiPhone,
  ValidationErrorCode,
} from "./types.js";

function unsupportedInput(value: unknown, label: string): DetailedValidationResult<never> {
  let code: ValidationErrorCode;
  let reason: string;

  if (value === undefined || value === null || value === "") {
    code = "REQUIRED";
    reason = "is required.";
  } else if (typeof value !== "string") {
    code = "INVALID_TYPE";
    reason = "has an invalid type.";
  } else {
    code = "INVALID_FORMAT";
    reason = "uses an unsupported representation.";
  }

  return { valid: false, code, message: `${label} ${reason}` };
}

function withCandidate<T>(
  result: DetailedValidationResult<T>,
  candidate: string,
): DetailedValidationResult<T> {
  if (result.valid) {
    return result;
  }

  return candidate.length > 0 && candidate.length <= 64
    ? { ...result, normalizedValue: candidate }
    : result;
}

/**
 * Normalizes and validates a Saudi IBAN using the same rules as normalizeIban and validateSaudiIbanDetailed.
 * @param value - Primitive string; ASCII spaces are removed and ASCII letters are uppercased.
 * @returns The validated uppercase IBAN, or a code and message. A safe candidate is included on validation failure.
 * @example
 * normalizeAndValidateIban("sa03 8000 0000 6080 1016 7519"); // { valid: true, value: "SA0380000000608010167519" }
 */
export function normalizeAndValidateIban(value: unknown): DetailedValidationResult<string> {
  const candidate = normalizeIbanInput(value);
  return candidate === null
    ? unsupportedInput(value, "Saudi IBAN")
    : withCandidate(validateSaudiIbanDetailed(candidate), candidate);
}

/**
 * Normalizes and validates a Saudi Short Address using the same rules as normalizeShortAddress and validateShortAddressDetailed.
 * @param value - Primitive string with four ASCII letters, optional one ASCII space, then ASCII digits.
 * @returns The validated uppercase eight-character address, or a code and message with a safe candidate when available.
 */
export function normalizeAndValidateShortAddress(value: unknown): DetailedValidationResult<string> {
  const candidate = normalizeShortAddressInput(value);
  return candidate === null
    ? unsupportedInput(value, "Short Address")
    : withCandidate(validateShortAddressDetailed(candidate), candidate);
}

/**
 * Normalizes and validates a Saudi mobile, landline, or toll-free number.
 * @param value - Primitive string in a supported unseparated national or country-code form.
 * @returns A kind-tagged canonical phone value, or a code and message with a safe candidate when available.
 * Mobile and landline values use +966 form; toll-free values use national 800 form.
 */
export function normalizeAndValidatePhoneNumber(
  value: unknown,
): DetailedValidationResult<NormalizedSaudiPhone> {
  const candidate = normalizePhoneNumberInput(value);

  if (candidate === null) {
    return unsupportedInput(value, "Phone number");
  }

  if (candidate.startsWith("800")) {
    const result = validateTollFreeNumberDetailed(candidate);
    return result.valid
      ? { valid: true, value: { kind: "toll-free", value: `800${result.value.slice(3)}` } }
      : withCandidate(result, candidate);
  }

  const result = candidate.startsWith("+9661")
    ? validateLandlineNumberDetailed(candidate)
    : validateMobileNumberDetailed(candidate);

  if (!result.valid) {
    return withCandidate(result, candidate);
  }

  return candidate.startsWith("+9661")
    ? { valid: true, value: { kind: "landline", value: `+966${result.value.slice(4)}` } }
    : { valid: true, value: { kind: "mobile", value: `+966${result.value.slice(4)}` } };
}

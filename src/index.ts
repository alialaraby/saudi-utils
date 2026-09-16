/** Temporary export used only to verify the Phase 1 package toolchain. */
export const bootstrapSmokeTest = (): true => true;

export {
  getSaudiIdType,
  isBorderId,
  isIqama,
  isNationalId,
  isSaudiId,
  validateBorderId,
  validateIqama,
  validateNationalId,
  validateSaudiId,
} from "./identity.js";

export type {
  NationalAddress,
  NationalAddressValidationResult,
  NormalizedSaudiPhone,
  ValidationErrorCode,
  ValidationEvidence,
  ValidationResult,
} from "./types.js";

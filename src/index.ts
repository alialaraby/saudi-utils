/** Temporary export used only to verify the Phase 1 package toolchain. */
export const bootstrapSmokeTest = (): true => true;

export { formatIban, isSaudiIban, normalizeIban, validateSaudiIban } from "./banking.js";

export {
  isAdditionalNumber,
  isBuildingNumber,
  isPostalCode,
  isShortAddress,
  normalizeShortAddress,
  validateAdditionalNumber,
  validateBuildingNumber,
  validateNationalAddress,
  validatePostalCode,
  validateShortAddress,
} from "./address.js";

export {
  isCommercialRegistration,
  isTin,
  isUnifiedNationalNumber,
  isVatNumber,
  validateCommercialRegistration,
  validateTin,
  validateUnifiedNationalNumber,
  validateVatNumber,
} from "./business.js";

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

export {
  isLandlineNumber,
  isMobileNumber,
  isTollFreeNumber,
  normalizePhoneNumber,
  validateLandlineNumber,
  validateMobileNumber,
  validateTollFreeNumber,
} from "./telecom.js";

export type {
  NationalAddress,
  NationalAddressValidationResult,
  NormalizedSaudiPhone,
  ValidationErrorCode,
  ValidationEvidence,
  ValidationResult,
} from "./types.js";

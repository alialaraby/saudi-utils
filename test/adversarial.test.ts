import { describe, expect, it } from "vitest";

import {
  isAdditionalNumber,
  isBorderId,
  isBuildingNumber,
  isCommercialRegistration,
  isIqama,
  isLandlineNumber,
  isMobileNumber,
  isNationalId,
  isPostalCode,
  isSaudiIban,
  isSaudiId,
  isShortAddress,
  isTin,
  isTollFreeNumber,
  isUnifiedNationalNumber,
  isVatNumber,
  validateAdditionalNumber,
  validateBorderId,
  validateBuildingNumber,
  validateCommercialRegistration,
  validateIqama,
  validateLandlineNumber,
  validateMobileNumber,
  validateNationalAddress,
  validateNationalId,
  validatePostalCode,
  validateSaudiIban,
  validateSaudiId,
  validateShortAddress,
  validateTin,
  validateTollFreeNumber,
  validateUnifiedNationalNumber,
  validateVatNumber,
} from "../src/index.js";
import type { ValidationResult } from "../src/index.js";
import { ADVERSARIAL_STRINGS, NON_STRING_INPUTS, REQUIRED_INPUTS } from "./fixtures/adversarial.js";

type DetailedValidator = (value: unknown) => ValidationResult;
type BooleanValidator = (value: unknown) => boolean;

const validators: ReadonlyArray<{
  name: string;
  validate: DetailedValidator;
  isValid: BooleanValidator;
}> = [
  { name: "National ID", validate: validateNationalId, isValid: isNationalId },
  { name: "Iqama", validate: validateIqama, isValid: isIqama },
  { name: "Saudi ID", validate: validateSaudiId, isValid: isSaudiId },
  { name: "Border ID", validate: validateBorderId, isValid: isBorderId },
  { name: "Saudi IBAN", validate: validateSaudiIban, isValid: isSaudiIban },
  { name: "VAT number", validate: validateVatNumber, isValid: isVatNumber },
  { name: "TIN", validate: validateTin, isValid: isTin },
  {
    name: "Unified National Number",
    validate: validateUnifiedNationalNumber,
    isValid: isUnifiedNationalNumber,
  },
  {
    name: "Commercial Registration",
    validate: validateCommercialRegistration,
    isValid: isCommercialRegistration,
  },
  { name: "mobile number", validate: validateMobileNumber, isValid: isMobileNumber },
  { name: "landline number", validate: validateLandlineNumber, isValid: isLandlineNumber },
  { name: "toll-free number", validate: validateTollFreeNumber, isValid: isTollFreeNumber },
  { name: "postal code", validate: validatePostalCode, isValid: isPostalCode },
  { name: "building number", validate: validateBuildingNumber, isValid: isBuildingNumber },
  {
    name: "additional number",
    validate: validateAdditionalNumber,
    isValid: isAdditionalNumber,
  },
  { name: "Short Address", validate: validateShortAddress, isValid: isShortAddress },
];

describe.each(validators)("$name shared adversarial corpus", ({ validate, isValid }) => {
  it.each(REQUIRED_INPUTS)("classifies required input %#", (value) => {
    expect(validate(value)).toEqual({ valid: false, code: "REQUIRED" });
    expect(isValid(value)).toBe(false);
  });

  it.each(NON_STRING_INPUTS)("rejects non-string input %# without coercion", (value) => {
    expect(validate(value)).toEqual({ valid: false, code: "INVALID_TYPE" });
    expect(isValid(value)).toBe(false);
  });

  it.each(ADVERSARIAL_STRINGS)("rejects hostile string representation %#", (value) => {
    expect(validate(value).valid).toBe(false);
    expect(isValid(value)).toBe(false);
  });
});

describe("National Address shared adversarial corpus", () => {
  it.each([...REQUIRED_INPUTS, ...NON_STRING_INPUTS, ...ADVERSARIAL_STRINGS])(
    "rejects root input %# without throwing",
    (value) => {
      expect(validateNationalAddress(value).valid).toBe(false);
    },
  );

  it("keeps root error categories explicit", () => {
    for (const value of REQUIRED_INPUTS) {
      expect(validateNationalAddress(value)).toEqual({ valid: false, code: "REQUIRED" });
    }

    for (const value of [
      0,
      42,
      1n,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      true,
      Symbol(),
      [],
      () => 0,
    ]) {
      expect(validateNationalAddress(value)).toEqual({ valid: false, code: "INVALID_TYPE" });
    }

    for (const value of [{}, new String("address")]) {
      expect(validateNationalAddress(value)).toEqual({ valid: false, code: "REQUIRED" });
    }
  });
});

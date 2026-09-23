import { describe, expect, it } from "vitest";

import {
  formatIban,
  normalizeIban,
  normalizePhoneNumber,
  normalizeShortAddress,
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
import { ONE_MIB_ASCII, ONE_MIB_PUNCTUATION } from "./fixtures/adversarial.js";

const validators: ReadonlyArray<(value: unknown) => ValidationResult> = [
  validateNationalId,
  validateIqama,
  validateSaudiId,
  validateBorderId,
  validateSaudiIban,
  validateVatNumber,
  validateTin,
  validateUnifiedNationalNumber,
  validateCommercialRegistration,
  validateMobileNumber,
  validateLandlineNumber,
  validateTollFreeNumber,
  validatePostalCode,
  validateBuildingNumber,
  validateAdditionalNumber,
  validateShortAddress,
];

describe("coarse hostile-input execution", () => {
  it(
    "rejects 1 MiB inputs across every string validator without exception",
    { timeout: 30_000 },
    () => {
      for (const validate of validators) {
        expect(validate(ONE_MIB_ASCII).valid).toBe(false);
        expect(validate(ONE_MIB_PUNCTUATION).valid).toBe(false);
      }
    },
  );

  it(
    "rejects 1 MiB inputs across representation helpers without exception",
    { timeout: 30_000 },
    () => {
      expect(normalizeIban(ONE_MIB_ASCII)?.length).toBe(ONE_MIB_ASCII.length);
      expect(normalizeIban(ONE_MIB_PUNCTUATION)).toBeNull();
      expect(formatIban(ONE_MIB_ASCII)).toBeNull();
      expect(normalizePhoneNumber(ONE_MIB_ASCII)).toBeNull();
      expect(normalizeShortAddress(ONE_MIB_ASCII)).toBeNull();
    },
  );

  it("rejects an address with a 1 MiB structural component", { timeout: 30_000 }, () => {
    expect(
      validateNationalAddress({
        buildingNumber: ONE_MIB_ASCII,
        street: "Street",
        district: "District",
        city: "City",
        postalCode: "12345",
        additionalNumber: "6789",
      }),
    ).toEqual({ valid: false, code: "INVALID_LENGTH" });
  });
});

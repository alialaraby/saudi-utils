import { describe, expect, it } from "vitest";

import {
  formatIban,
  getSaudiIdType,
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
import type { NationalAddress, ValidationResult } from "../src/index.js";
import { REFERENCE_SAUDI_IBAN } from "./fixtures/iban.js";
import { SYNTHETIC_IQAMAS, SYNTHETIC_NATIONAL_IDS } from "./fixtures/identity.js";

type DetailedValidator = (value: unknown) => ValidationResult;
type BooleanValidator = (value: unknown) => boolean;

const validatorPairs: ReadonlyArray<{
  validate: DetailedValidator;
  isValid: BooleanValidator;
  validValue: string;
}> = [
  { validate: validateNationalId, isValid: isNationalId, validValue: SYNTHETIC_NATIONAL_IDS[0] },
  { validate: validateIqama, isValid: isIqama, validValue: SYNTHETIC_IQAMAS[0] },
  { validate: validateSaudiId, isValid: isSaudiId, validValue: SYNTHETIC_NATIONAL_IDS[0] },
  { validate: validateBorderId, isValid: isBorderId, validValue: "3000000000" },
  { validate: validateSaudiIban, isValid: isSaudiIban, validValue: REFERENCE_SAUDI_IBAN },
  { validate: validateVatNumber, isValid: isVatNumber, validValue: "300000000000003" },
  { validate: validateTin, isValid: isTin, validValue: "0123456789" },
  {
    validate: validateUnifiedNationalNumber,
    isValid: isUnifiedNationalNumber,
    validValue: "7123456789",
  },
  {
    validate: validateCommercialRegistration,
    isValid: isCommercialRegistration,
    validValue: "1234567890",
  },
  { validate: validateMobileNumber, isValid: isMobileNumber, validValue: "0501234567" },
  { validate: validateLandlineNumber, isValid: isLandlineNumber, validValue: "0112345678" },
  { validate: validateTollFreeNumber, isValid: isTollFreeNumber, validValue: "8001234567" },
  { validate: validatePostalCode, isValid: isPostalCode, validValue: "01234" },
  { validate: validateBuildingNumber, isValid: isBuildingNumber, validValue: "0123" },
  { validate: validateAdditionalNumber, isValid: isAdditionalNumber, validValue: "0000" },
  { validate: validateShortAddress, isValid: isShortAddress, validValue: "ABCD0123" },
];

describe("cross-domain invariants", () => {
  it.each(validatorPairs)("keeps boolean and detailed validation equivalent", (pair) => {
    for (const value of [pair.validValue, undefined, null, "", 123, `${pair.validValue}x`]) {
      expect(pair.isValid(value)).toBe(pair.validate(value).valid);
    }
  });

  it.each(validatorPairs)("is deterministic and leaves inputs unchanged", (pair) => {
    const input = Object.freeze({ value: pair.validValue });
    const before = Reflect.ownKeys(input);

    expect(pair.validate(pair.validValue)).toEqual(pair.validate(pair.validValue));
    expect(pair.validate(input)).toEqual(pair.validate(input));
    expect(Reflect.ownKeys(input)).toEqual(before);
    expect(input.value).toBe(pair.validValue);
  });

  it("keeps every successful normalizer idempotent", () => {
    const iban = normalizeIban("sa03 8000 0000 6080 1016 7519");
    const phone = normalizePhoneNumber("00966501234567");
    const shortAddress = normalizeShortAddress("abcd 0123");

    expect(iban).toBe(REFERENCE_SAUDI_IBAN);
    expect(normalizeIban(iban)).toBe(iban);
    expect(phone).toEqual({ kind: "mobile", value: "+966501234567" });
    expect(normalizePhoneNumber(phone?.value)).toEqual(phone);
    expect(shortAddress).toBe("ABCD0123");
    expect(normalizeShortAddress(shortAddress)).toBe(shortAddress);
    expect(formatIban(iban)).toBe("SA03 8000 0000 6080 1016 7519");
  });

  it("keeps National ID and Iqama mutually exclusive and type detection aligned", () => {
    for (const value of [...SYNTHETIC_NATIONAL_IDS, ...SYNTHETIC_IQAMAS]) {
      const national = isNationalId(value);
      const iqama = isIqama(value);

      expect(national && iqama).toBe(false);
      expect(isSaudiId(value)).toBe(national || iqama);
      expect(getSaudiIdType(value)).toBe(national ? "national-id" : "iqama");
    }

    expect(getSaudiIdType("3000000000")).toBeNull();
  });

  it("preserves the documented business structural overlaps", () => {
    expect([
      isTin("7123456789"),
      isCommercialRegistration("7123456789"),
      isUnifiedNationalNumber("7123456789"),
      isVatNumber("7123456789"),
    ]).toEqual([true, true, true, false]);
    expect([
      isTin("1234567890"),
      isCommercialRegistration("1234567890"),
      isUnifiedNationalNumber("1234567890"),
      isVatNumber("1234567890"),
    ]).toEqual([true, true, false, false]);
  });

  it.each([
    ["0501234567", "mobile", "+966501234567", validateMobileNumber],
    ["0112345678", "landline", "+966112345678", validateLandlineNumber],
    ["8001234567", "toll-free", "8001234567", validateTollFreeNumber],
  ] as const)(
    "keeps normalized phone kind %s aligned with its validator",
    (input, kind, value, validate) => {
      const normalized = normalizePhoneNumber(input);

      expect(normalized).toEqual({ kind, value });
      expect(validate(value).valid).toBe(true);
    },
  );

  it("returns a fresh National Address without extra properties or input mutation", () => {
    const address: NationalAddress & { extra: string } = {
      buildingNumber: "0123",
      street: "King Fahd Road",
      district: "Al Olaya",
      city: "Riyadh",
      postalCode: "01234",
      additionalNumber: "0000",
      extra: "not public output",
    };
    const snapshot = { ...address };
    const result = validateNationalAddress(address);

    expect(result.valid).toBe(true);
    expect(address).toEqual(snapshot);
    if (result.valid) {
      expect(result.value).not.toBe(address);
      expect(Object.keys(result.value)).not.toContain("extra");
    }
  });
});

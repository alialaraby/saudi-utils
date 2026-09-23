import { describe, expect, it } from "vitest";

import * as api from "../src/index.js";
import { REFERENCE_SAUDI_IBAN } from "./fixtures/iban.js";
import { SYNTHETIC_NATIONAL_IDS } from "./fixtures/identity.js";
import type { DetailedValidationResult, NationalAddress } from "../src/index.js";

const address: NationalAddress = {
  buildingNumber: "0123",
  street: "King Fahd Road",
  district: "Al Olaya",
  city: "Riyadh",
  postalCode: "01234",
  additionalNumber: "0000",
};

const cases = [
  ["NationalId", SYNTHETIC_NATIONAL_IDS[0]],
  ["Iqama", "2000000006"],
  ["SaudiId", SYNTHETIC_NATIONAL_IDS[0]],
  ["BorderId", "3000000000"],
  ["SaudiIban", REFERENCE_SAUDI_IBAN],
  ["VatNumber", "300000000000003"],
  ["Tin", "1234567890"],
  ["UnifiedNationalNumber", "7000000000"],
  ["CommercialRegistration", "1234567890"],
  ["MobileNumber", "0501234567"],
  ["LandlineNumber", "0112345678"],
  ["TollFreeNumber", "8001234567"],
  ["PostalCode", "01234"],
  ["BuildingNumber", "0123"],
  ["AdditionalNumber", "0000"],
  ["ShortAddress", "ABCD0123"],
  ["NationalAddress", address],
] as const;

describe("explained validation", () => {
  it.each(cases)("shares success and failure decisions with validate%s", (name, validValue) => {
    const validate = api[`validate${name}`] as (value: unknown) => unknown;
    const detailed = api[`validate${name}Detailed`] as (
      value: unknown,
    ) => DetailedValidationResult<string | NationalAddress>;

    expect(detailed(validValue)).toEqual(validate(validValue));

    for (const input of [undefined, null, "", 123, " ", "invalid", validValue]) {
      const base = validate(input) as { valid: boolean; code?: string; value?: unknown };
      const explained = detailed(input);
      expect(explained.valid).toBe(base.valid);
      if (base.valid) {
        expect(explained).toEqual(base);
      } else {
        expect(explained).toMatchObject({ valid: false, code: base.code });
        expect(explained.valid).toBe(false);
        if (!explained.valid) {
          expect(explained.message).toMatch(/^[A-Z].+\.$/);
        }
      }
    }
  });

  it.each([
    [undefined, "REQUIRED", "Saudi IBAN is required."],
    [42, "INVALID_TYPE", "Saudi IBAN has an invalid type."],
    ["SA", "INVALID_LENGTH", "Saudi IBAN has an invalid length."],
    ["SA038000000060801016751!", "INVALID_FORMAT", "Saudi IBAN has an invalid format."],
    ["ES0380000000608010167519", "INVALID_PREFIX", "Saudi IBAN has an invalid prefix."],
    ["SA0380000000608010167518", "INVALID_CHECKSUM", "Saudi IBAN has an invalid checksum."],
  ] as const)("explains %s with %s", (input, code, message) => {
    expect(api.validateSaudiIbanDetailed(input)).toEqual({ valid: false, code, message });
    expect(api.isSaudiIban(input)).toBe(false);
  });

  it("preserves boolean helper and old result contracts", () => {
    expect(api.isSaudiIban(REFERENCE_SAUDI_IBAN)).toBe(true);
    expect(api.validateSaudiIban(REFERENCE_SAUDI_IBAN)).toEqual({
      valid: true,
      value: REFERENCE_SAUDI_IBAN,
    });
    expect(api.validateSaudiIban("bad")).toEqual({ valid: false, code: "INVALID_LENGTH" });
  });

  it("uses the object result type for National Address", () => {
    const result: DetailedValidationResult<NationalAddress> =
      api.validateNationalAddressDetailed(address);
    expect(result).toEqual({ valid: true, value: address });
    expect(api.validateNationalAddressDetailed({ ...address, postalCode: "12" })).toEqual({
      valid: false,
      code: "INVALID_LENGTH",
      message: "National Address has an invalid length.",
    });
  });
});

// @ts-expect-error A failure must include a message.
const missingMessage: DetailedValidationResult = { valid: false, code: "INVALID_FORMAT" };
// @ts-expect-error Success must include the validated value.
const missingValue: DetailedValidationResult = { valid: true };
// @ts-expect-error Codes remain restricted to the public error union.
const unknownCode: DetailedValidationResult = { valid: false, code: "UNKNOWN", message: "Bad." };
void [missingMessage, missingValue, unknownCode];

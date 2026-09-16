import { describe, expect, it } from "vitest";

import type {
  NationalAddress,
  NationalAddressValidationResult,
  NormalizedSaudiPhone,
  ValidationErrorCode,
  ValidationEvidence,
  ValidationResult,
} from "../src/index.js";

function readValidationResult(result: ValidationResult): string | ValidationErrorCode {
  return result.valid ? result.value : result.code;
}

describe("public types", () => {
  it("supports both validation result branches and narrowing", () => {
    const valid: ValidationResult = { valid: true, value: "canonical" };
    const invalid: ValidationResult = { valid: false, code: "INVALID_FORMAT" };

    expect(readValidationResult(valid)).toBe("canonical");
    expect(readValidationResult(invalid)).toBe("INVALID_FORMAT");
  });

  it("supports every approved evidence value", () => {
    const evidence: ValidationEvidence[] = [
      "official-checksum",
      "official-structural",
      "official-structural-community-checksum",
      "best-known-structural",
    ];

    expect(evidence).toHaveLength(4);
  });

  it("supports each normalized Saudi phone variant", () => {
    const phones: NormalizedSaudiPhone[] = [
      { kind: "mobile", value: "+966501234567" },
      { kind: "landline", value: "+966112345678" },
      { kind: "toll-free", value: "8001234567" },
    ];

    expect(phones.map(({ kind }) => kind)).toEqual(["mobile", "landline", "toll-free"]);
  });

  it("supports national address validation results", () => {
    const address: NationalAddress = {
      buildingNumber: "1234",
      street: "Example Street",
      district: "Example District",
      city: "Riyadh",
      postalCode: "12345",
      additionalNumber: "6789",
    };
    const valid: NationalAddressValidationResult = { valid: true, value: address };
    const invalid: NationalAddressValidationResult = { valid: false, code: "REQUIRED" };

    expect(valid.value).toBe(address);
    expect(invalid.code).toBe("REQUIRED");
  });
});

// @ts-expect-error A valid result must contain its canonical value.
const missingValidValue: ValidationResult = { valid: true };

// @ts-expect-error Error codes are restricted to the approved union.
const unknownErrorCode: ValidationResult = { valid: false, code: "UNKNOWN" };

// @ts-expect-error Mobile values must use the +966 template literal prefix.
const invalidMobile: NormalizedSaudiPhone = { kind: "mobile", value: "0501234567" };

// @ts-expect-error Toll-free values must use the 800 template literal prefix.
const invalidTollFree: NormalizedSaudiPhone = { kind: "toll-free", value: "+9668001234567" };

void [missingValidValue, unknownErrorCode, invalidMobile, invalidTollFree];

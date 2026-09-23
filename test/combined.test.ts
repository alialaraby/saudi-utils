import { describe, expect, it } from "vitest";

import {
  normalizeAndValidateIban,
  normalizeAndValidatePhoneNumber,
  normalizeAndValidateShortAddress,
  normalizeIban,
  normalizePhoneNumber,
  normalizeShortAddress,
  validateSaudiIbanDetailed,
  validateShortAddressDetailed,
} from "../src/index.js";
import type { DetailedValidationResult, NormalizedSaudiPhone } from "../src/index.js";

const IBAN = "SA0380000000608010167519";

function expectFailure(
  result: DetailedValidationResult<unknown>,
  code: string,
  message: string,
  normalizedValue?: string,
): void {
  expect(result).toEqual({
    valid: false,
    code,
    message,
    ...(normalizedValue === undefined ? {} : { normalizedValue }),
  });
}

describe("combined normalization and validation", () => {
  it.each(["sa03 8000 0000 6080 1016 7519", IBAN])(
    "normalizes and validates an IBAN: %s",
    (input) => {
      expect(normalizeAndValidateIban(input)).toEqual({ valid: true, value: IBAN });
      expect(normalizeAndValidateIban(input)).toEqual(
        validateSaudiIbanDetailed(normalizeIban(input)),
      );
    },
  );

  it("reports a checksum failure after IBAN normalization and preserves the candidate", () => {
    const candidate = "SA0380000000608010167518";
    expectFailure(
      normalizeAndValidateIban("sa03 8000 0000 6080 1016 7518"),
      "INVALID_CHECKSUM",
      "Saudi IBAN has an invalid checksum.",
      candidate,
    );
    expect(normalizeIban("sa03 8000 0000 6080 1016 7518")).toBe(candidate);
    expect(validateSaudiIbanDetailed(candidate)).toEqual({
      valid: false,
      code: "INVALID_CHECKSUM",
      message: "Saudi IBAN has an invalid checksum.",
    });
  });

  it("normalizes and validates Short Addresses", () => {
    expect(normalizeAndValidateShortAddress("abcd 0123")).toEqual({
      valid: true,
      value: "ABCD0123",
    });
    expect(normalizeAndValidateShortAddress("ABCD0123")).toEqual(
      validateShortAddressDetailed(normalizeShortAddress("ABCD0123")),
    );
    expectFailure(
      normalizeAndValidateShortAddress("abcd 12"),
      "INVALID_LENGTH",
      "Short Address has an invalid length.",
      "ABCD12",
    );
    expect(normalizeShortAddress("abcd 12")).toBe("ABCD12");
  });

  it.each([
    ["0501234567", { kind: "mobile", value: "+966501234567" }],
    ["966112345678", { kind: "landline", value: "+966112345678" }],
    ["8001234567", { kind: "toll-free", value: "8001234567" }],
  ] as const)("normalizes and validates a phone number: %s", (input, expected) => {
    expect(normalizeAndValidatePhoneNumber(input)).toEqual({ valid: true, value: expected });
    expect(normalizeAndValidatePhoneNumber(input).valid).toBe(true);
    expect(normalizePhoneNumber(input)).toBe(expected.value);
  });

  it("reports a phone prefix failure on the normalized candidate", () => {
    expectFailure(
      normalizeAndValidatePhoneNumber("00966152345678"),
      "INVALID_PREFIX",
      "Landline number has an invalid prefix.",
      "+966152345678",
    );
    expect(normalizePhoneNumber("00966152345678")).toBe("+966152345678");
    expectFailure(
      normalizeAndValidatePhoneNumber("0601234567"),
      "INVALID_PREFIX",
      "Mobile number has an invalid prefix.",
      "+966601234567",
    );
  });

  it("reports an invalid toll-free length after selecting the national representation", () => {
    expectFailure(
      normalizeAndValidatePhoneNumber("800123456"),
      "INVALID_LENGTH",
      "Toll-free number has an invalid length.",
      "800123456",
    );
    expect(normalizePhoneNumber("800123456")).toBe("800123456");
  });

  it.each([
    [normalizeAndValidateIban, "Saudi IBAN"],
    [normalizeAndValidateShortAddress, "Short Address"],
    [normalizeAndValidatePhoneNumber, "Phone number"],
  ] as const)("handles unsupported input without guessing a rule", (operation, label) => {
    expectFailure(operation(undefined), "REQUIRED", `${label} is required.`);
    expectFailure(operation(123), "INVALID_TYPE", `${label} has an invalid type.`);
    expectFailure(
      operation("wrong-format!"),
      "INVALID_FORMAT",
      `${label} uses an unsupported representation.`,
    );
  });

  it("keeps normalized candidates out of failures when they are too large", () => {
    expectFailure(
      normalizeAndValidateIban("A".repeat(100)),
      "INVALID_LENGTH",
      "Saudi IBAN has an invalid length.",
    );
  });
});

const ibanResult: DetailedValidationResult<string> = normalizeAndValidateIban(IBAN);
const phoneResult: DetailedValidationResult<NormalizedSaudiPhone> =
  normalizeAndValidatePhoneNumber("0501234567");
// @ts-expect-error Phone success has a kind-tagged value, not a string.
const invalidPhoneType: DetailedValidationResult<string> =
  normalizeAndValidatePhoneNumber("0501234567");
void [ibanResult, phoneResult, invalidPhoneType];

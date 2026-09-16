import { describe, expect, it, vi } from "vitest";

import {
  isCommercialRegistration,
  isTin,
  isUnifiedNationalNumber,
  isVatNumber,
  validateCommercialRegistration,
  validateTin,
  validateUnifiedNationalNumber,
  validateVatNumber,
} from "../src/index.js";
import type { ValidationResult } from "../src/index.js";

type DetailedValidator = (value: unknown) => ValidationResult;
type BooleanValidator = (value: unknown) => value is string;

const VAT_NUMBER = "300000000000003";
const TIN = "0123456789";
const UNIFIED_NATIONAL_NUMBER = "7123456789";
const LEGACY_COMMERCIAL_REGISTRATION = "1234567890";

const validators: ReadonlyArray<{
  name: string;
  validate: DetailedValidator;
  isValid: BooleanValidator;
  validValue: string;
}> = [
  { name: "VAT", validate: validateVatNumber, isValid: isVatNumber, validValue: VAT_NUMBER },
  { name: "TIN", validate: validateTin, isValid: isTin, validValue: TIN },
  {
    name: "Unified National Number",
    validate: validateUnifiedNationalNumber,
    isValid: isUnifiedNationalNumber,
    validValue: UNIFIED_NATIONAL_NUMBER,
  },
  {
    name: "legacy Commercial Registration",
    validate: validateCommercialRegistration,
    isValid: isCommercialRegistration,
    validValue: LEGACY_COMMERCIAL_REGISTRATION,
  },
];

function expectFailure(result: ValidationResult, code: string): void {
  expect(result).toEqual({ valid: false, code });
}

describe("VAT Registration Number validation", () => {
  it.each([VAT_NUMBER, "312345678901233", "399999999999993"])(
    "accepts canonical value %s without claiming a checksum",
    (value) => {
      expect(validateVatNumber(value)).toEqual({ valid: true, value });
      expect(isVatNumber(value)).toBe(true);
    },
  );

  it.each([
    ["400000000000003", "wrong first digit"],
    ["300000000000004", "wrong last digit"],
    ["400000000000004", "wrong boundary digits"],
  ])("rejects %s with %s", (value) => {
    expectFailure(validateVatNumber(value), "INVALID_PREFIX");
  });

  it.each(["3A0000000000003", "3000000-0000003", `${VAT_NUMBER.slice(0, -1)}٣`])(
    "rejects an internal or boundary non-ASCII digit in %s",
    (value) => {
      expectFailure(validateVatNumber(value), "INVALID_FORMAT");
    },
  );
});

describe("TIN and legacy Commercial Registration validation", () => {
  it.each(["0000000000", "0123456789", "9999999999"])(
    "accepts exact 10-digit TIN structure %s",
    (value) => {
      expect(validateTin(value)).toEqual({ valid: true, value });
    },
  );

  it.each(["0000000000", "1234567890", "9999999999"])(
    "accepts exact 10-digit legacy CR structure %s",
    (value) => {
      expect(validateCommercialRegistration(value)).toEqual({ valid: true, value });
    },
  );

  it("does not treat TIN as a VAT Registration Number", () => {
    expect(isTin(TIN)).toBe(true);
    expectFailure(validateVatNumber(TIN), "INVALID_LENGTH");
    expect(isVatNumber(VAT_NUMBER)).toBe(true);
    expectFailure(validateTin(VAT_NUMBER), "INVALID_LENGTH");
  });

  it("does not implement legacy CR as a Unified National Number alias", () => {
    expect(isCommercialRegistration(LEGACY_COMMERCIAL_REGISTRATION)).toBe(true);
    expectFailure(validateUnifiedNationalNumber(LEGACY_COMMERCIAL_REGISTRATION), "INVALID_PREFIX");
  });
});

describe("Unified National Number validation", () => {
  it.each(["7000000000", "7123456789", "7999999999"])(
    "accepts canonical value %s, including non-700 prefixes",
    (value) => {
      expect(validateUnifiedNationalNumber(value)).toEqual({ valid: true, value });
      expect(isUnifiedNationalNumber(value)).toBe(true);
    },
  );

  it.each(["0000000000", "6999999999", "8000000000", "9999999999"])(
    "rejects wrong prefix in %s",
    (value) => {
      expectFailure(validateUnifiedNationalNumber(value), "INVALID_PREFIX");
    },
  );
});

describe("intentional business identifier overlap", () => {
  it.each([
    [UNIFIED_NATIONAL_NUMBER, true, true, true, false],
    [LEGACY_COMMERCIAL_REGISTRATION, true, true, false, false],
    [TIN, true, true, false, false],
    [VAT_NUMBER, false, false, false, true],
  ])(
    "applies each independent grammar to %s",
    (value, tin, commercialRegistration, unifiedNationalNumber, vat) => {
      expect(isTin(value)).toBe(tin);
      expect(isCommercialRegistration(value)).toBe(commercialRegistration);
      expect(isUnifiedNationalNumber(value)).toBe(unifiedNationalNumber);
      expect(isVatNumber(value)).toBe(vat);
    },
  );
});

describe.each(validators)("$name shared contract", ({ validate, isValid, validValue }) => {
  it.each([
    [undefined, "REQUIRED"],
    [null, "REQUIRED"],
    ["", "REQUIRED"],
    [0, "INVALID_TYPE"],
    [1n, "INVALID_TYPE"],
    [new String(validValue), "INVALID_TYPE"],
    [[], "INVALID_TYPE"],
    [{}, "INVALID_TYPE"],
    [" ", "INVALID_LENGTH"],
    [validValue.slice(0, -1), "INVALID_LENGTH"],
    [`${validValue}0`, "INVALID_LENGTH"],
    [` ${validValue.slice(1)}`, "INVALID_FORMAT"],
    [`${validValue.slice(0, -1)} `, "INVALID_FORMAT"],
    [`${validValue.slice(0, 1)}-${validValue.slice(2)}`, "INVALID_FORMAT"],
  ])("preserves required/type/length/format precedence for input %#", (value, code) => {
    expectFailure(validate(value), code);
  });

  it.each([
    "٠١٢٣٤٥٦٧٨٩",
    "۰۱۲۳۴۵۶۷۸۹",
    "０１２３４５６７８９",
    "0١23456789",
    "O123456789",
    "0I23456789",
    "01234\u200b6789",
    "01234\u200f6789",
    "01234\u202e6789",
    "01234\u00a06789",
  ])("rejects Unicode, lookalike, invisible, NBSP, or bidi input %#", (value) => {
    expect(validate(value).valid).toBe(false);
    expect(isValid(value)).toBe(false);
  });

  it("keeps the boolean and detailed validators equivalent", () => {
    for (const value of [
      validValue,
      undefined,
      null,
      "",
      123,
      1n,
      new String(validValue),
      `${validValue}0`,
      validValue.replace(validValue[1] ?? "0", "A"),
    ]) {
      expect(isValid(value)).toBe(validate(value).valid);
    }
  });

  it("is deterministic and does not mutate or coerce input", () => {
    const coercionAccessed = vi.fn(() => {
      throw new Error("coercion hook accessed");
    });
    const input = Object.freeze(
      Object.defineProperties(
        {},
        {
          [Symbol.toPrimitive]: { get: coercionAccessed },
          toString: { get: coercionAccessed },
          valueOf: { get: coercionAccessed },
        },
      ),
    );

    expect(validate(input)).toEqual(validate(input));
    expectFailure(validate(input), "INVALID_TYPE");
    expect(isValid(input)).toBe(false);
    expect(coercionAccessed).not.toHaveBeenCalled();
    expect(Object.isFrozen(input)).toBe(true);
  });

  it("rejects an extremely long input by length", () => {
    const input = "7".repeat(1024 * 1024);

    expectFailure(validate(input), "INVALID_LENGTH");
    expect(isValid(input)).toBe(false);
  });
});

describe("leading-zero preservation", () => {
  it.each([
    [validateTin, "0000000001"],
    [validateCommercialRegistration, "0000000001"],
  ] as const)("returns the original canonical string", (validate, value) => {
    expect(validate(value)).toEqual({ valid: true, value });
  });
});

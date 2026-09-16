import { describe, expect, it, vi } from "vitest";

import {
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
} from "../src/index.js";
import type {
  NationalAddress,
  NationalAddressValidationResult,
  ValidationResult,
} from "../src/index.js";

type DetailedValidator = (value: unknown) => ValidationResult;
type BooleanValidator = (value: unknown) => value is string;

const VALID_ADDRESS: NationalAddress = {
  buildingNumber: "0123",
  street: "King Fahd Road",
  district: "Al Olaya",
  city: "Riyadh",
  postalCode: "01234",
  additionalNumber: "0000",
};

const componentValidators: ReadonlyArray<{
  name: string;
  validate: DetailedValidator;
  isValid: BooleanValidator;
  validValue: string;
}> = [
  {
    name: "postal code",
    validate: validatePostalCode,
    isValid: isPostalCode,
    validValue: "01234",
  },
  {
    name: "building number",
    validate: validateBuildingNumber,
    isValid: isBuildingNumber,
    validValue: "0123",
  },
  {
    name: "additional number",
    validate: validateAdditionalNumber,
    isValid: isAdditionalNumber,
    validValue: "0000",
  },
  {
    name: "Short Address",
    validate: validateShortAddress,
    isValid: isShortAddress,
    validValue: "ABCD0123",
  },
];

function expectFailure(
  result: ValidationResult | NationalAddressValidationResult,
  code: string,
): void {
  expect(result).toEqual({ valid: false, code });
}

describe("National Address component validators", () => {
  it.each([
    [validatePostalCode, "00000"],
    [validatePostalCode, "01234"],
    [validateBuildingNumber, "0000"],
    [validateBuildingNumber, "0123"],
    [validateAdditionalNumber, "0000"],
    [validateAdditionalNumber, "0123"],
    [validateShortAddress, "ABCD0000"],
    [validateShortAddress, "WXYZ0123"],
  ] as const)("accepts canonical input %s", (validate, value) => {
    expect(validate(value)).toEqual({ valid: true, value });
  });

  describe.each(componentValidators)(
    "$name shared contract",
    ({ validate, isValid, validValue }) => {
      it.each([
        [undefined, "REQUIRED"],
        [null, "REQUIRED"],
        ["", "REQUIRED"],
        [0, "INVALID_TYPE"],
        [1n, "INVALID_TYPE"],
        [new String(validValue), "INVALID_TYPE"],
        [[], "INVALID_TYPE"],
        [{}, "INVALID_TYPE"],
        [validValue.slice(1), "INVALID_LENGTH"],
        [`${validValue}0`, "INVALID_LENGTH"],
        [` ${validValue.slice(1)}`, "INVALID_FORMAT"],
        [`${validValue.slice(0, -1)} `, "INVALID_FORMAT"],
        [`${validValue.slice(0, 1)}-${validValue.slice(2)}`, "INVALID_FORMAT"],
      ])("preserves error precedence for input %#", (value, code) => {
        expectFailure(validate(value), code);
      });

      it("keeps the boolean and detailed APIs equivalent", () => {
        for (const value of [
          validValue,
          undefined,
          null,
          "",
          123,
          new String(validValue),
          validValue.slice(1),
          `${validValue.slice(0, -1)}A`,
        ]) {
          expect(isValid(value)).toBe(validate(value).valid);
        }
      });

      it("is deterministic and rejects extremely long input by length", () => {
        const input = "0".repeat(1024 * 1024);

        expect(validate(validValue)).toEqual(validate(validValue));
        expectFailure(validate(input), "INVALID_LENGTH");
        expect(isValid(input)).toBe(false);
      });
    },
  );

  it.each([
    "٠١٢٣٤",
    "۰۱۲۳۴",
    "０１２３４",
    "0١234",
    "0123\u200b",
    "0123\u200f",
    "0123\u202e",
    "0123\u00a0",
  ])("rejects non-ASCII postal-code input %#", (value) => {
    expectFailure(validatePostalCode(value), "INVALID_FORMAT");
  });

  it.each(["٠١٢٣", "۰۱۲۳", "０１２３", "0١23", "012\u200b", "012\u200f", "012\u202e", "012\u00a0"])(
    "rejects non-ASCII four-digit component input %#",
    (value) => {
      expectFailure(validateBuildingNumber(value), "INVALID_FORMAT");
      expectFailure(validateAdditionalNumber(value), "INVALID_FORMAT");
    },
  );

  it.each([
    "abcd0123",
    "AbCD0123",
    "ABC 0123",
    "ABCD 123",
    "ABCD-123",
    "ÄBCD0123",
    "ابجد0123",
    "ABCD٠١٢٣",
    "ABCD۰۱۲۳",
    "ABCD０１２３",
    "ABCD0١23",
    "ABC\u200b0123",
    "ABCD012\u200f",
  ])("rejects non-canonical Short Address input %#", (value) => {
    expect(validateShortAddress(value).valid).toBe(false);
    expect(isShortAddress(value)).toBe(false);
  });
});

describe("Short Address normalization", () => {
  it.each([
    ["ABCD0123", "ABCD0123"],
    ["abcd0123", "ABCD0123"],
    ["AbCd 0123", "ABCD0123"],
    ["wxyz 0000", "WXYZ0000"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeShortAddress(input)).toBe(expected);
    expect(normalizeShortAddress(expected)).toBe(expected);
  });

  it.each([
    undefined,
    null,
    123,
    new String("ABCD0123"),
    " ABCD0123",
    "ABCD0123 ",
    "ABCD  0123",
    "AB CD0123",
    "ABCD 01 23",
    "ABCD-0123",
    "ABCD_0123",
    "ÄBCD0123",
    "ابجد0123",
    "ABCD٠١٢٣",
    "ABCD۰۱۲۳",
    "ABCD０１２３",
    "ABC\u200bD0123",
    "ABCD\u00a00123",
  ])("rejects unsupported input %#", (value) => {
    expect(normalizeShortAddress(value)).toBeNull();
  });
});

describe("National Address object validation", () => {
  it("returns a fresh plain object containing only the required fields", () => {
    const input = { ...VALID_ADDRESS, extra: "ignored", constructor: "also ignored" };
    const result = validateNationalAddress(input);

    expect(result).toEqual({ valid: true, value: VALID_ADDRESS });
    expect(result.valid && result.value).not.toBe(input);
    expect(result.valid && Object.getPrototypeOf(result.value)).toBe(Object.prototype);
    expect(result.valid && Object.keys(result.value)).toEqual([
      "buildingNumber",
      "street",
      "district",
      "city",
      "postalCode",
      "additionalNumber",
    ]);
  });

  it.each(Object.keys(VALID_ADDRESS) as Array<keyof NationalAddress>)(
    "requires own data property %s",
    (field) => {
      const input: Partial<NationalAddress> = { ...VALID_ADDRESS };
      delete input[field];

      expectFailure(validateNationalAddress(input), "REQUIRED");
    },
  );

  it.each(Object.keys(VALID_ADDRESS) as Array<keyof NationalAddress>)(
    "treats empty field %s as required",
    (field) => {
      expectFailure(validateNationalAddress({ ...VALID_ADDRESS, [field]: "" }), "REQUIRED");
    },
  );

  it.each(Object.keys(VALID_ADDRESS) as Array<keyof NationalAddress>)(
    "rejects a non-string %s",
    (field) => {
      expectFailure(validateNationalAddress({ ...VALID_ADDRESS, [field]: 123 }), "INVALID_TYPE");
    },
  );

  it("uses required, type, and fixed field precedence", () => {
    expectFailure(
      validateNationalAddress({ ...VALID_ADDRESS, buildingNumber: "12", street: undefined }),
      "INVALID_TYPE",
    );
    expectFailure(
      validateNationalAddress({ ...VALID_ADDRESS, buildingNumber: "12", street: "" }),
      "REQUIRED",
    );
    expectFailure(
      validateNationalAddress({
        ...VALID_ADDRESS,
        buildingNumber: "12",
        postalCode: "123",
        additionalNumber: "12A4",
      }),
      "INVALID_LENGTH",
    );
    expectFailure(
      validateNationalAddress({
        ...VALID_ADDRESS,
        buildingNumber: "1234",
        postalCode: "12A45",
        additionalNumber: "12A4",
      }),
      "INVALID_FORMAT",
    );
  });

  it("accepts whitespace-only and extremely long text fields without hidden policy", () => {
    const longStreet = "x".repeat(1024 * 1024);
    const result = validateNationalAddress({ ...VALID_ADDRESS, street: longStreet, city: " " });

    expect(result.valid && result.value.street).toBe(longStreet);
    expect(result.valid && result.value.city).toBe(" ");
  });

  it.each([undefined, null, ""])("returns REQUIRED for root input %#", (value) => {
    expectFailure(validateNationalAddress(value), "REQUIRED");
  });

  it.each([0, 1n, true, "address", [], () => VALID_ADDRESS])(
    "returns INVALID_TYPE for root input %#",
    (value) => {
      expectFailure(validateNationalAddress(value), "INVALID_TYPE");
    },
  );

  it.each([new String("address"), new Date(0)])(
    "rejects object input without required fields %#",
    (value) => {
      expectFailure(validateNationalAddress(value), "REQUIRED");
    },
  );

  it("rejects inherited fields", () => {
    const input = Object.create(VALID_ADDRESS) as object;

    expectFailure(validateNationalAddress(input), "REQUIRED");
  });

  it("rejects accessors without invoking them", () => {
    const getter = vi.fn(() => {
      throw new Error("getter invoked");
    });
    const input = { ...VALID_ADDRESS };
    Object.defineProperty(input, "buildingNumber", { get: getter });

    expectFailure(validateNationalAddress(input), "REQUIRED");
    expect(getter).not.toHaveBeenCalled();
  });

  it("handles a null-prototype object safely", () => {
    const input = Object.assign(Object.create(null) as object, VALID_ADDRESS);

    expect(validateNationalAddress(input)).toEqual({ valid: true, value: VALID_ADDRESS });
  });

  it("ignores own pollution-oriented keys and never copies them", () => {
    const input = { ...VALID_ADDRESS, constructor: "ignored" };
    Object.defineProperty(input, "__proto__", {
      enumerable: true,
      value: { polluted: true },
    });
    const result = validateNationalAddress(input);

    expect(result).toEqual({ valid: true, value: VALID_ADDRESS });
    expect(result.valid && Object.hasOwn(result.value, "__proto__")).toBe(false);
    expect(result.valid && result.value.constructor).toBe(Object);
  });

  it("does not allow polluted prototypes to supply required fields", () => {
    const input = Object.create({ buildingNumber: "1234", __proto__: VALID_ADDRESS }) as object;
    Object.assign(input, {
      street: VALID_ADDRESS.street,
      district: VALID_ADDRESS.district,
      city: VALID_ADDRESS.city,
      postalCode: VALID_ADDRESS.postalCode,
      additionalNumber: VALID_ADDRESS.additionalNumber,
    });

    expectFailure(validateNationalAddress(input), "REQUIRED");
  });

  it("does not mutate input and returns a detached value", () => {
    const input = Object.freeze({ ...VALID_ADDRESS });
    const result = validateNationalAddress(input);

    expect(result).toEqual({ valid: true, value: VALID_ADDRESS });
    expect(Object.isFrozen(input)).toBe(true);
    if (result.valid) {
      result.value.street = "Changed";
      expect(input.street).toBe(VALID_ADDRESS.street);
    }
  });

  it("rejects extremely long components early and is deterministic", () => {
    const input = { ...VALID_ADDRESS, buildingNumber: "1".repeat(1024 * 1024) };

    expectFailure(validateNationalAddress(input), "INVALID_LENGTH");
    expect(validateNationalAddress(input)).toEqual(validateNationalAddress(input));
  });
});

import { describe, expect, it, vi } from "vitest";

import {
  getSaudiIdType,
  isBorderId,
  isIqama,
  isNationalId,
  isSaudiId,
  validateBorderId,
  validateIqama,
  validateNationalId,
  validateSaudiId,
} from "../src/index.js";
import type { ValidationResult } from "../src/index.js";
import { hasValidSaudiIdentityChecksum } from "../src/internal/identity-checksum.js";
import {
  INVALID_IQAMA_CHECKSUMS,
  INVALID_NATIONAL_ID_CHECKSUMS,
  SYNTHETIC_BORDER_IDS,
  SYNTHETIC_IQAMAS,
  SYNTHETIC_NATIONAL_IDS,
} from "./fixtures/identity.js";

const nonStringInputs = [
  0,
  1n,
  Number.NaN,
  Number.POSITIVE_INFINITY,
  false,
  Symbol("identity"),
  () => "1000000008",
  {},
  [],
  new String("1000000008"),
];

const invalidFormatInputs = [
  "100000000 ",
  " 000000008",
  "10000-0008",
  "10000_0008",
  "10000/0008",
  "10000.0008",
  "1000(0)008",
  "10000000\n8",
  "10000000\t8",
  "10000000\u00a0",
  "1000\u200b00008",
  "1000\u200f00008",
  "١٠٠٠٠٠٠٠٠٨",
  "۱۰۰۰۰۰۰۰۰۸",
  "１００００００００８",
  "100000000٨",
  "1O00000008",
] as const;

function mutateEachDigit(value: string): string[] {
  return [...value].map((digit, index) => {
    const replacement = (Number(digit) + 1) % 10;
    return `${value.slice(0, index)}${replacement}${value.slice(index + 1)}`;
  });
}

function expectFailure(result: ValidationResult, code: string): void {
  expect(result).toEqual({ valid: false, code });
}

describe("National ID", () => {
  it.each(SYNTHETIC_NATIONAL_IDS)("accepts synthetic checksum-valid fixture %s", (value) => {
    expect(validateNationalId(value)).toEqual({ valid: true, value });
    expect(isNationalId(value)).toBe(true);
  });

  it.each(INVALID_NATIONAL_ID_CHECKSUMS)("rejects checksum-invalid fixture %s", (value) => {
    expectFailure(validateNationalId(value), "INVALID_CHECKSUM");
  });

  it("covers a valid checksum digit of zero", () => {
    expect(SYNTHETIC_NATIONAL_IDS[1].endsWith("0")).toBe(true);
    expect(validateNationalId(SYNTHETIC_NATIONAL_IDS[1]).valid).toBe(true);
  });

  it("rejects a mutation at every digit position", () => {
    for (const value of mutateEachDigit(SYNTHETIC_NATIONAL_IDS[0])) {
      expect(isNationalId(value)).toBe(false);
    }
  });

  it.each([
    [undefined, "REQUIRED"],
    [null, "REQUIRED"],
    ["", "REQUIRED"],
    [0, "INVALID_TYPE"],
    [" ", "INVALID_LENGTH"],
    ["100000008", "INVALID_LENGTH"],
    ["10000000008", "INVALID_LENGTH"],
    ["100000000A", "INVALID_FORMAT"],
    ["2000000006", "INVALID_PREFIX"],
    ["1000000007", "INVALID_CHECKSUM"],
  ])("preserves precedence for %j", (value, code) => {
    expectFailure(validateNationalId(value), code);
  });
});

describe("Iqama", () => {
  it.each(SYNTHETIC_IQAMAS)("accepts synthetic checksum-valid fixture %s", (value) => {
    expect(validateIqama(value)).toEqual({ valid: true, value });
    expect(isIqama(value)).toBe(true);
  });

  it.each(INVALID_IQAMA_CHECKSUMS)("rejects checksum-invalid fixture %s", (value) => {
    expectFailure(validateIqama(value), "INVALID_CHECKSUM");
  });

  it("covers a valid checksum digit of zero", () => {
    expect(SYNTHETIC_IQAMAS[1].endsWith("0")).toBe(true);
    expect(validateIqama(SYNTHETIC_IQAMAS[1]).valid).toBe(true);
  });

  it("rejects a mutation at every digit position", () => {
    for (const value of mutateEachDigit(SYNTHETIC_IQAMAS[0])) {
      expect(isIqama(value)).toBe(false);
    }
  });

  it.each([
    [undefined, "REQUIRED"],
    [null, "REQUIRED"],
    ["", "REQUIRED"],
    [false, "INVALID_TYPE"],
    ["\t", "INVALID_LENGTH"],
    ["200000006", "INVALID_LENGTH"],
    ["20000000006", "INVALID_LENGTH"],
    ["200000000A", "INVALID_FORMAT"],
    ["1000000008", "INVALID_PREFIX"],
    ["2000000007", "INVALID_CHECKSUM"],
  ])("preserves precedence for %j", (value, code) => {
    expectFailure(validateIqama(value), code);
  });

  it("rejects National ID and Iqama values across types", () => {
    expectFailure(validateNationalId(SYNTHETIC_IQAMAS[0]), "INVALID_PREFIX");
    expectFailure(validateIqama(SYNTHETIC_NATIONAL_IDS[0]), "INVALID_PREFIX");
  });
});

describe("Saudi ID composition and type detection", () => {
  it.each([
    [SYNTHETIC_NATIONAL_IDS[0], "national-id"],
    [SYNTHETIC_IQAMAS[0], "iqama"],
  ] as const)("accepts %s and identifies it as %s", (value, type) => {
    expect(validateSaudiId(value)).toEqual({ valid: true, value });
    expect(isSaudiId(value)).toBe(true);
    expect(getSaudiIdType(value)).toBe(type);
  });

  it.each([
    [undefined, "REQUIRED"],
    [new String(SYNTHETIC_NATIONAL_IDS[0]), "INVALID_TYPE"],
    ["100000008", "INVALID_LENGTH"],
    ["100000000A", "INVALID_FORMAT"],
    ["3000000000", "INVALID_PREFIX"],
    [INVALID_NATIONAL_ID_CHECKSUMS[0], "INVALID_CHECKSUM"],
    [INVALID_IQAMA_CHECKSUMS[0], "INVALID_CHECKSUM"],
  ])("returns %s precedence result", (value, code) => {
    expectFailure(validateSaudiId(value), code);
    expect(isSaudiId(value)).toBe(false);
    expect(getSaudiIdType(value)).toBeNull();
  });
});

describe("Border ID", () => {
  it.each(SYNTHETIC_BORDER_IDS)("accepts synthetic prefix fixture %s", (value) => {
    expect(validateBorderId(value)).toEqual({ valid: true, value });
    expect(isBorderId(value)).toBe(true);
  });

  it.each(["0", "1", "2", "5", "6", "7", "8", "9"])("rejects unsupported prefix %s", (prefix) => {
    expectFailure(validateBorderId(`${prefix}000000000`), "INVALID_PREFIX");
  });

  it("does not apply the Saudi identity checksum", () => {
    for (const value of SYNTHETIC_BORDER_IDS) {
      expect(hasValidSaudiIdentityChecksum(value)).toBe(false);
      expect(validateBorderId(value)).toEqual({ valid: true, value });
    }
  });

  it.each([
    [undefined, "REQUIRED"],
    [null, "REQUIRED"],
    ["", "REQUIRED"],
    [1n, "INVALID_TYPE"],
    [" ", "INVALID_LENGTH"],
    ["300000000", "INVALID_LENGTH"],
    ["30000000000", "INVALID_LENGTH"],
    ["300000000A", "INVALID_FORMAT"],
    ["5000000000", "INVALID_PREFIX"],
  ])("preserves precedence for input %#", (value, code) => {
    expectFailure(validateBorderId(value), code);
  });
});

describe("identity validator hardening", () => {
  const validators = [
    ["National ID", validateNationalId, isNationalId],
    ["Iqama", validateIqama, isIqama],
    ["Saudi ID", validateSaudiId, isSaudiId],
    ["Border ID", validateBorderId, isBorderId],
  ] as const;

  it.each(validators)(
    "%s rejects every non-string without coercion",
    (_name, validate, isValid) => {
      for (const value of nonStringInputs) {
        expectFailure(validate(value), "INVALID_TYPE");
        expect(isValid(value)).toBe(false);
      }
    },
  );

  it.each(validators)(
    "%s rejects adversarial string representations",
    (_name, validate, isValid) => {
      for (const value of invalidFormatInputs) {
        expect(validate(value).valid).toBe(false);
        expect(isValid(value)).toBe(false);
      }
    },
  );

  it.each(validators)(
    "%s boolean helper equals its detailed validator",
    (_name, validate, isValid) => {
      for (const value of [
        undefined,
        null,
        "",
        123,
        "short",
        ...invalidFormatInputs,
        ...SYNTHETIC_NATIONAL_IDS,
        ...SYNTHETIC_IQAMAS,
        ...SYNTHETIC_BORDER_IDS,
      ]) {
        expect(isValid(value)).toBe(validate(value).valid);
      }
    },
  );

  it.each(validators)("%s is deterministic and does not mutate input", (_name, validate) => {
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

    const first = validate(input);
    const second = validate(input);

    expect(first).toEqual(second);
    expect(first).toEqual({ valid: false, code: "INVALID_TYPE" });
    expect(coercionAccessed).not.toHaveBeenCalled();
    expect(Object.isFrozen(input)).toBe(true);
  });

  it.each(validators)("%s rejects a 1 MiB input by length", (_name, validate, isValid) => {
    const input = "1".repeat(1024 * 1024);

    expectFailure(validate(input), "INVALID_LENGTH");
    expect(isValid(input)).toBe(false);
  });
});

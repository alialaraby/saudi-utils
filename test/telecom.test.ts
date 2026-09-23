import { describe, expect, it, vi } from "vitest";

import * as packageApi from "../src/index.js";
import {
  isLandlineNumber,
  isMobileNumber,
  isTollFreeNumber,
  normalizePhoneNumber,
  validateLandlineNumber,
  validateMobileNumber,
  validateTollFreeNumber,
} from "../src/index.js";
import type { ValidationResult } from "../src/index.js";

type DetailedValidator = (value: unknown) => ValidationResult;
type BooleanValidator = (value: unknown) => value is string;

const MOBILE_NATIONAL = "0501234567";
const MOBILE_E164 = "+966501234567";
const LANDLINE_NATIONAL = "0112345678";
const LANDLINE_E164 = "+966112345678";
const TOLL_FREE = "8001234567";

const validators: ReadonlyArray<{
  name: string;
  validate: DetailedValidator;
  isValid: BooleanValidator;
  validValue: string;
}> = [
  {
    name: "mobile",
    validate: validateMobileNumber,
    isValid: isMobileNumber,
    validValue: MOBILE_NATIONAL,
  },
  {
    name: "landline",
    validate: validateLandlineNumber,
    isValid: isLandlineNumber,
    validValue: LANDLINE_NATIONAL,
  },
  {
    name: "toll-free",
    validate: validateTollFreeNumber,
    isValid: isTollFreeNumber,
    validValue: TOLL_FREE,
  },
];

function expectFailure(result: ValidationResult, code: string): void {
  expect(result).toEqual({ valid: false, code });
}

describe("mobile validation", () => {
  it.each([MOBILE_NATIONAL, MOBILE_E164])("accepts canonical representation %s", (value) => {
    expect(validateMobileNumber(value)).toEqual({ valid: true, value });
    expect(isMobileNumber(value)).toBe(true);
  });

  it.each(Array.from({ length: 10 }, (_, digit) => `05${digit}1234567`))(
    "accepts the complete structural 05X range without carrier assumptions: %s",
    (value) => {
      expect(validateMobileNumber(value)).toEqual({ valid: true, value });
    },
  );

  it.each(["0491234567", "0601234567", "+966401234567", "+966601234567"])(
    "rejects neighboring service prefix %s",
    (value) => {
      expectFailure(validateMobileNumber(value), "INVALID_PREFIX");
    },
  );
});

describe("landline validation", () => {
  it.each(["011", "012", "013", "014", "016", "017"])(
    "accepts geographic code %s in national and E.164 representations",
    (code) => {
      const national = `${code}2345678`;
      const international = `+966${code.slice(1)}2345678`;

      expect(validateLandlineNumber(national)).toEqual({ valid: true, value: national });
      expect(validateLandlineNumber(international)).toEqual({
        valid: true,
        value: international,
      });
    },
  );

  it.each(["010", "015", "018", "019"])("rejects unsupported geographic code %s", (code) => {
    expectFailure(validateLandlineNumber(`${code}2345678`), "INVALID_PREFIX");
    expectFailure(validateLandlineNumber(`+966${code.slice(1)}2345678`), "INVALID_PREFIX");
  });

  it.each(["0201234567", "+966201234567", MOBILE_NATIONAL, MOBILE_E164])(
    "rejects neighboring or mobile prefix %s",
    (value) => {
      expectFailure(validateLandlineNumber(value), "INVALID_PREFIX");
    },
  );
});

describe("toll-free validation", () => {
  it.each(["8000000000", TOLL_FREE, "8009999999"])("accepts national structure %s", (value) => {
    expect(validateTollFreeNumber(value)).toEqual({ valid: true, value });
    expect(isTollFreeNumber(value)).toBe(true);
  });

  it.each(["9200123456", "8101234567", "9001234567"])(
    "rejects unified-access or neighboring service prefix %s",
    (value) => {
      expectFailure(validateTollFreeNumber(value), "INVALID_PREFIX");
    },
  );

  it.each(["+9668001234567", "9668001234567", "009668001234567"])(
    "rejects international-looking representation %s",
    (value) => {
      expect(validateTollFreeNumber(value).valid).toBe(false);
      expect(normalizePhoneNumber(value)).toBeNull();
    },
  );
});

describe("phone normalization", () => {
  it.each([
    [MOBILE_NATIONAL, "mobile", MOBILE_E164],
    [MOBILE_E164, "mobile", MOBILE_E164],
    ["966501234567", "mobile", MOBILE_E164],
    ["00966501234567", "mobile", MOBILE_E164],
    [LANDLINE_NATIONAL, "landline", LANDLINE_E164],
    [LANDLINE_E164, "landline", LANDLINE_E164],
    ["966112345678", "landline", LANDLINE_E164],
    ["00966112345678", "landline", LANDLINE_E164],
    [TOLL_FREE, "toll-free", TOLL_FREE],
    ["0601234567", "mobile", "+966601234567"],
    ["966601234567", "mobile", "+966601234567"],
    ["00966152345678", "landline", "+966152345678"],
    ["800123456", "toll-free", "800123456"],
  ] as const)("normalizes %s as %s", (input, kind, value) => {
    expect(normalizePhoneNumber(input)).toEqual({ kind, value });
  });

  it.each([
    { kind: "mobile", value: MOBILE_E164 },
    { kind: "landline", value: LANDLINE_E164 },
    { kind: "toll-free", value: TOLL_FREE },
    { kind: "mobile", value: "+966601234567" },
    { kind: "landline", value: "+966152345678" },
  ] as const)("is idempotent for canonical $kind output", ({ value }) => {
    const first = normalizePhoneNumber(value);

    expect(first).not.toBeNull();
    expect(normalizePhoneNumber(first?.value)).toEqual(first);
  });

  it.each([
    "501234567",
    "0066501234567",
    "0096501234567",
    "00966966501234567",
    "966966501234567",
    "+966966501234567",
    "+9660501234567",
    "9660501234567",
    "009660501234567",
    "+00966501234567",
    "00966+501234567",
    "000966501234567",
  ])("rejects malformed, duplicated, missing, or mixed prefix %s", (value) => {
    expect(normalizePhoneNumber(value)).toBeNull();
  });

  it.each([
    "050 123 4567",
    "800123456x",
    "050-123-4567",
    "(050)1234567",
    "050.123.4567",
    "050/123/4567",
    "050_123_4567",
    "0501234567x1",
    "0501234567 ext 1",
    " 0501234567",
    "0501234567 ",
    "050\u00a01234567",
    "05012\u200b34567",
    "05012\u200f34567",
    "05012\u202e34567",
    "٠٥٠١٢٣٤٥٦٧",
    "۰۵۰۱۲۳۴۵۶۷",
    "０５０１２３４５６７",
    "05٠1234567",
  ])("rejects formatted, extended, whitespace, invisible, or Unicode input %#", (value) => {
    expect(normalizePhoneNumber(value)).toBeNull();
  });

  it.each([undefined, null, 501234567, 1n, new String(MOBILE_NATIONAL), [], {}])(
    "rejects unsupported input %# without coercion",
    (value) => {
      expect(normalizePhoneNumber(value)).toBeNull();
    },
  );

  it("rejects an extremely long input", () => {
    expect(normalizePhoneNumber("9".repeat(1024 * 1024))).toBeNull();
  });
});

describe.each(validators)(
  "$name shared validation contract",
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
      [" ", "INVALID_LENGTH"],
      [validValue.slice(0, -1), "INVALID_LENGTH"],
      [`${validValue}0`, "INVALID_LENGTH"],
      [` ${validValue.slice(1)}`, "INVALID_FORMAT"],
      [`${validValue.slice(0, -1)} `, "INVALID_FORMAT"],
      [`${validValue.slice(0, 3)}-${validValue.slice(4)}`, "INVALID_FORMAT"],
    ])("preserves required/type/length/format precedence for input %#", (value, code) => {
      expectFailure(validate(value), code);
    });

    it.each([
      "٠١٢٣٤٥٦٧٨٩",
      "۰۱۲۳۴۵۶۷۸۹",
      "０１２３４５６７８９",
      "0١23456789",
      "O501234567",
      "05012\u200b4567",
      "05012\u200f4567",
      "05012\u202e4567",
      "05012\u00a04567",
    ])("rejects non-ASCII, lookalike, invisible, NBSP, or bidi input %#", (value) => {
      expect(validate(value).valid).toBe(false);
      expect(isValid(value)).toBe(false);
    });

    it("keeps the boolean and detailed validators equivalent", () => {
      for (const value of [validValue, undefined, null, 123, `${validValue}0`, "A".repeat(10)]) {
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
      expect(normalizePhoneNumber(input)).toBeNull();
      expect(coercionAccessed).not.toHaveBeenCalled();
      expect(Object.isFrozen(input)).toBe(true);
    });

    it("rejects an extremely long input by length and never reports a checksum error", () => {
      const input = "5".repeat(1024 * 1024);

      expectFailure(validate(input), "INVALID_LENGTH");
      expect(isValid(input)).toBe(false);
      expect(validate("A".repeat(10))).not.toEqual({ valid: false, code: "INVALID_CHECKSUM" });
    });
  },
);

describe("carrier-neutral public API", () => {
  it("does not expose carrier detection", () => {
    expect(
      Object.keys(packageApi).filter((name) => name.toLowerCase().includes("carrier")),
    ).toEqual([]);
  });
});

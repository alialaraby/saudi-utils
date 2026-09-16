import { describe, expect, it } from "vitest";

import { isAsciiDigits, isUppercaseAsciiAlphanumeric } from "../../src/internal/ascii.js";

describe("isAsciiDigits", () => {
  it.each(["0", "0123456789"])("accepts ASCII digits %j", (value) => {
    expect(isAsciiDigits(value)).toBe(true);
  });

  it.each(["", "٠١٢٣٤٥٦٧٨٩", "۰۱۲۳۴۵۶۷۸۹", "０１２３４５６７８９", "123٤", "12 3", "123\u200b"])(
    "rejects non-ASCII-digit input %j",
    (value) => {
      expect(isAsciiDigits(value)).toBe(false);
    },
  );
});

describe("isUppercaseAsciiAlphanumeric", () => {
  it.each(["A", "Z0", "SA123"])("accepts uppercase ASCII alphanumeric input %j", (value) => {
    expect(isUppercaseAsciiAlphanumeric(value)).toBe(true);
  });

  it.each(["", "abc", "ABC-123", "ABC 123", "Ä", "ＡBC", "ABC\u200f"])(
    "rejects other input %j",
    (value) => {
      expect(isUppercaseAsciiAlphanumeric(value)).toBe(false);
    },
  );
});

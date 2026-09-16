import { describe, expect, it, vi } from "vitest";

import { checkStringInput } from "../../src/internal/input.js";

describe("checkStringInput", () => {
  it.each([undefined, null, ""])("returns REQUIRED for %s", (input) => {
    expect(checkStringInput(input)).toEqual({ valid: false, code: "REQUIRED" });
  });

  it.each([" ", "\t", "\n", "  \t  "])("preserves non-empty whitespace %j", (input) => {
    expect(checkStringInput(input)).toEqual({ valid: true, value: input });
  });

  it.each([
    0,
    1n,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    true,
    Symbol("value"),
    () => "value",
    {},
    [],
    new String("value"),
  ])("returns INVALID_TYPE without coercing %s", (input) => {
    expect(checkStringInput(input)).toEqual({ valid: false, code: "INVALID_TYPE" });
  });

  it("does not inspect coercion hooks", () => {
    const coercionAccessed = vi.fn(() => {
      throw new Error("coercion hook accessed");
    });
    const input = Object.defineProperties(
      {},
      {
        [Symbol.toPrimitive]: { get: coercionAccessed },
        toString: { get: coercionAccessed },
        valueOf: { get: coercionAccessed },
      },
    );

    expect(checkStringInput(input)).toEqual({ valid: false, code: "INVALID_TYPE" });
    expect(coercionAccessed).not.toHaveBeenCalled();
  });
});

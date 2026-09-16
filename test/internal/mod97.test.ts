import { describe, expect, it } from "vitest";

import { mod97 } from "../../src/internal/mod97.js";

function mod97WithBigInt(value: string): number {
  return Number(BigInt(value) % 97n);
}

describe("mod97", () => {
  it.each([
    ["0", 0],
    ["1", 1],
    ["96", 96],
    ["97", 0],
    ["98", 1],
    ["3214282912345698765432161182", 1],
  ])("returns the remainder for %s", (value, expected) => {
    expect(mod97(value)).toBe(expected);
  });

  it("preserves the numeric meaning of leading zeroes", () => {
    expect(mod97("0000000098")).toBe(1);
  });

  it("matches an independent BigInt oracle for a long deterministic value", () => {
    const value = "1234567890".repeat(1_000);

    expect(mod97(value)).toBe(mod97WithBigInt(value));
  });

  it.each(["", "12A", "١٢", "１２"])("throws for invalid precondition input %j", (value) => {
    expect(() => mod97(value)).toThrowError(
      new TypeError("mod97 requires a non-empty ASCII numeric string"),
    );
  });

  it("throws predictably when called with a non-string at runtime", () => {
    expect(() => mod97(97 as unknown as string)).toThrowError(
      new TypeError("mod97 requires a non-empty ASCII numeric string"),
    );
  });
});

import { describe, expect, it } from "vitest";

import { hasValidSaudiIdentityChecksum } from "../../src/internal/identity-checksum.js";

describe("hasValidSaudiIdentityChecksum", () => {
  it.each(["1000000008", "2000000006", "9100000000", "9000000001"])(
    "accepts valid checksum vector %s",
    (value) => {
      expect(hasValidSaudiIdentityChecksum(value)).toBe(true);
    },
  );

  it.each(["1000000007", "2000000007", "9000000002"])(
    "rejects invalid checksum vector %s",
    (value) => {
      expect(hasValidSaudiIdentityChecksum(value)).toBe(false);
    },
  );

  it("rejects a mutation at every digit position", () => {
    const valid = "1000000008";

    for (let index = 0; index < valid.length; index += 1) {
      const digit = Number(valid[index]);
      const mutated = `${valid.slice(0, index)}${(digit + 1) % 10}${valid.slice(index + 1)}`;

      expect(hasValidSaudiIdentityChecksum(mutated)).toBe(false);
    }
  });

  it("checks only the checksum and does not enforce identity prefixes", () => {
    expect(hasValidSaudiIdentityChecksum("0000000000")).toBe(true);
  });

  it.each(["", "123456789", "12345678901", "123456789A", "١٢٣٤٥٦٧٨٩٠"])(
    "throws for invalid precondition input %j",
    (value) => {
      expect(() => hasValidSaudiIdentityChecksum(value)).toThrowError(
        new TypeError("Saudi identity checksum requires exactly 10 ASCII digits"),
      );
    },
  );

  it("throws predictably when called with a non-string at runtime", () => {
    expect(() => hasValidSaudiIdentityChecksum(123 as unknown as string)).toThrowError(
      new TypeError("Saudi identity checksum requires exactly 10 ASCII digits"),
    );
  });
});

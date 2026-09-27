import { describe, expect, it } from "vitest";

import {
  canonicalizeIban,
  canonicalizePhoneNumber,
  canonicalizeShortAddress,
  normalizeIban,
  normalizePhoneNumber,
  normalizeShortAddress,
} from "../src/index.js";
import type { NormalizedSaudiPhone } from "../src/index.js";

describe("v0.1.0 normalizer compatibility", () => {
  it("keeps IBAN normalization coupled to Saudi validation", () => {
    expect(normalizeIban("sa03 8000 0000 6080 1016 7519")).toBe("SA0380000000608010167519");
    expect(normalizeIban("sa03 8000 0000 6080 1016 7518")).toBeNull();
    expect(normalizeIban("gb82 west 1234 5698 7654 32")).toBeNull();
    expect(normalizeIban("SA03-8000")).toBeNull();
    expect(canonicalizeIban("sa03 8000 0000 6080 1016 7518")).toBe("SA0380000000608010167518");
  });

  it("keeps Short Address normalization coupled to the four-digit rule", () => {
    expect(normalizeShortAddress("abcd 0123")).toBe("ABCD0123");
    expect(normalizeShortAddress("abcd 12")).toBeNull();
    expect(normalizeShortAddress("abcd-0123")).toBeNull();
    expect(canonicalizeShortAddress("abcd 12")).toBe("ABCD12");
  });

  it.each([
    ["0501234567", { kind: "mobile", value: "+966501234567" }],
    ["+966501234567", { kind: "mobile", value: "+966501234567" }],
    ["966501234567", { kind: "mobile", value: "+966501234567" }],
    ["00966501234567", { kind: "mobile", value: "+966501234567" }],
    ["0112345678", { kind: "landline", value: "+966112345678" }],
    ["+966112345678", { kind: "landline", value: "+966112345678" }],
    ["966112345678", { kind: "landline", value: "+966112345678" }],
    ["00966112345678", { kind: "landline", value: "+966112345678" }],
    ["8001234567", { kind: "toll-free", value: "8001234567" }],
  ] as const)("restores the kind-tagged phone result for %s", (input, expected) => {
    const result: NormalizedSaudiPhone | null = normalizePhoneNumber(input);
    expect(result).toEqual(expected);
  });

  it("keeps legacy phone null behavior while exposing canonical candidates", () => {
    expect(normalizePhoneNumber(501234567)).toBeNull();
    expect(normalizePhoneNumber("0601234567")).toBeNull();
    expect(normalizePhoneNumber("800123456")).toBeNull();
    expect(normalizePhoneNumber("050-123-4567")).toBeNull();
    expect(canonicalizePhoneNumber("0601234567")).toBe("+966601234567");
    expect(canonicalizePhoneNumber("800123456")).toBe("800123456");
  });
});

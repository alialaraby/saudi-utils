import { describe, expect, it, vi } from "vitest";

import { formatIban, isSaudiIban, normalizeIban, validateSaudiIban } from "../src/index.js";
import type { ValidationResult } from "../src/index.js";
import {
  REFERENCE_SAUDI_IBAN,
  SYNTHETIC_SAUDI_IBAN,
  VALID_NON_SAUDI_IBAN,
} from "./fixtures/iban.js";

function expandIbanForOracle(value: string): string {
  let expanded = "";

  for (const character of `${value.slice(4)}${value.slice(0, 4)}`) {
    const code = character.charCodeAt(0);
    expanded += code >= 65 && code <= 90 ? String(code - 55) : character;
  }

  return expanded;
}

function mod97WithBigInt(value: string): number {
  return Number(BigInt(expandIbanForOracle(value)) % 97n);
}

function mutateCharacter(value: string, index: number): string {
  const character = value[index];
  const replacement = character === "9" ? "0" : String(Number(character) + 1);
  return `${value.slice(0, index)}${replacement}${value.slice(index + 1)}`;
}

function expectFailure(result: ValidationResult, code: string): void {
  expect(result).toEqual({ valid: false, code });
}

describe("Saudi IBAN validation", () => {
  it("accepts the approved SWIFT reference fixture", () => {
    expect(mod97WithBigInt(REFERENCE_SAUDI_IBAN)).toBe(1);
    expect(validateSaudiIban(REFERENCE_SAUDI_IBAN)).toEqual({
      valid: true,
      value: REFERENCE_SAUDI_IBAN,
    });
    expect(isSaudiIban(REFERENCE_SAUDI_IBAN)).toBe(true);
  });

  it("accepts a clearly labelled synthetic alphanumeric BBAN fixture", () => {
    expect(mod97WithBigInt(SYNTHETIC_SAUDI_IBAN)).toBe(1);
    expect(validateSaudiIban(SYNTHETIC_SAUDI_IBAN)).toEqual({
      valid: true,
      value: SYNTHETIC_SAUDI_IBAN,
    });
  });

  it("matches an independent BigInt MOD-97 oracle", () => {
    for (const value of [REFERENCE_SAUDI_IBAN, SYNTHETIC_SAUDI_IBAN]) {
      expect(isSaudiIban(value)).toBe(mod97WithBigInt(value) === 1);
    }
  });

  it("rejects mutation of either checksum digit", () => {
    for (const index of [2, 3]) {
      const mutated = mutateCharacter(REFERENCE_SAUDI_IBAN, index);

      expect(mod97WithBigInt(mutated)).not.toBe(1);
      expectFailure(validateSaudiIban(mutated), "INVALID_CHECKSUM");
    }
  });

  it("rejects mutation of every BBAN position", () => {
    for (let index = 4; index < REFERENCE_SAUDI_IBAN.length; index += 1) {
      const mutated = mutateCharacter(REFERENCE_SAUDI_IBAN, index);

      expect(mod97WithBigInt(mutated)).not.toBe(1);
      expectFailure(validateSaudiIban(mutated), "INVALID_CHECKSUM");
    }
  });

  it.each([4, 5])("requires bank-identifier position %i to be numeric", (index) => {
    const value = `${REFERENCE_SAUDI_IBAN.slice(0, index)}A${REFERENCE_SAUDI_IBAN.slice(index + 1)}`;

    expectFailure(validateSaudiIban(value), "INVALID_FORMAT");
  });

  it("rejects a checksum-valid non-Saudi IBAN by prefix", () => {
    expect(VALID_NON_SAUDI_IBAN).toHaveLength(24);
    expect(mod97WithBigInt(VALID_NON_SAUDI_IBAN)).toBe(1);
    expectFailure(validateSaudiIban(VALID_NON_SAUDI_IBAN), "INVALID_PREFIX");
  });

  it.each([
    [undefined, "REQUIRED"],
    [null, "REQUIRED"],
    ["", "REQUIRED"],
    [0, "INVALID_TYPE"],
    [" ", "INVALID_LENGTH"],
    [REFERENCE_SAUDI_IBAN.slice(0, -1), "INVALID_LENGTH"],
    [`${REFERENCE_SAUDI_IBAN}0`, "INVALID_LENGTH"],
    ["SA0A80000000608010167519", "INVALID_FORMAT"],
    ["1A0380000000608010167519", "INVALID_FORMAT"],
    ["SA03A0000000608010167519", "INVALID_FORMAT"],
    ["sa0380000000608010167519", "INVALID_FORMAT"],
    ["SA03 0000000608010167519", "INVALID_FORMAT"],
    ["US0380000000608010167519", "INVALID_PREFIX"],
    [mutateCharacter(REFERENCE_SAUDI_IBAN, 3), "INVALID_CHECKSUM"],
  ])("preserves error precedence for input %#", (value, code) => {
    expectFailure(validateSaudiIban(value), code);
  });
});

describe("IBAN normalization", () => {
  it.each([
    [REFERENCE_SAUDI_IBAN.toLowerCase(), REFERENCE_SAUDI_IBAN],
    ["SA03 8000 0000 6080 1016 7519", REFERENCE_SAUDI_IBAN],
    [" sa03  8000 0000 6080 1016 7519 ", REFERENCE_SAUDI_IBAN],
    [SYNTHETIC_SAUDI_IBAN.toLowerCase(), SYNTHETIC_SAUDI_IBAN],
    ["sa03 8000 0000 6080 1016 7518", "SA0380000000608010167518"],
    [VALID_NON_SAUDI_IBAN.toLowerCase(), VALID_NON_SAUDI_IBAN],
    ["sa", "SA"],
  ])("normalizes approved representation %#", (value, expected) => {
    expect(normalizeIban(value)).toBe(expected);
  });

  it("is idempotent after successful normalization", () => {
    const normalized = normalizeIban("sa03 8000 0000 6080 1016 7519");

    expect(normalized).toBe(REFERENCE_SAUDI_IBAN);
    expect(normalizeIban(normalized)).toBe(normalized);
  });

  it.each([
    undefined,
    null,
    123,
    1n,
    new String(REFERENCE_SAUDI_IBAN),
    "",
    "   ",
    "SA03-8000-0000-6080-1016-7519",
    "SA03\u00a08000\u00a00000\u00a06080\u00a01016\u00a07519",
    "SA03\t\t80000000608010167519",
    "SA03\n80000000608010167519",
    "SA03\u200b80000000608010167519",
    "SA03\u200f80000000608010167519",
    "ＳＡ０３８０００００００６０８０１０１６７５１９",
    "SA٠٣٨٠٠٠٠٠٠٠٦٠٨٠١٠١٦٧٥١٩",
    "SA۰۳۸۰۰۰۰۰۰۰۶۰۸۰۱۰۱۶۷۵۱۹",
    "SA０３８０００００００６０８０１０１６７５１９",
    "SA03_80000000608010167519",
    "SA03.80000000608010167519",
    "SA03/80000000608010167519",
    "SA03(80000000608010167519)",
  ])("rejects unsupported representation %#", (value) => {
    expect(normalizeIban(value)).toBeNull();
  });
});

describe("IBAN formatting", () => {
  it.each([
    [REFERENCE_SAUDI_IBAN, "SA03 8000 0000 6080 1016 7519"],
    [SYNTHETIC_SAUDI_IBAN, "SA52 20AB CDEF 1234 5678 9012"],
  ])("formats canonical value %s", (value, expected) => {
    expect(formatIban(value)).toBe(expected);
  });

  it.each([
    undefined,
    null,
    123,
    REFERENCE_SAUDI_IBAN.toLowerCase(),
    "SA03 8000 0000 6080 1016 7519",
    mutateCharacter(REFERENCE_SAUDI_IBAN, 3),
    VALID_NON_SAUDI_IBAN,
  ])("does not normalize or format invalid input %#", (value) => {
    expect(formatIban(value)).toBeNull();
  });
});

describe("banking API hardening", () => {
  const nonStringInputs = [
    0,
    1n,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    false,
    Symbol("iban"),
    () => REFERENCE_SAUDI_IBAN,
    {},
    [],
    new String(REFERENCE_SAUDI_IBAN),
  ];

  const adversarialStrings = [
    ` ${REFERENCE_SAUDI_IBAN.slice(1)}`,
    `${REFERENCE_SAUDI_IBAN.slice(0, -1)} `,
    "SA03-80000000608010167519",
    "SA03\u00a080000000608010167519",
    "SA03\u200b80000000608010167519",
    "SA03\u200f80000000608010167519",
    "SA03\t80000000608010167519",
    "SA03\n80000000608010167519",
    "SA٠٣٨٠٠٠٠٠٠٠٦٠٨٠١٠١٦٧٥١٩",
    "SA۰۳۸۰۰۰۰۰۰۰۶۰۸۰۱۰۱۶۷۵۱۹",
    "SA０３８０００００００６０８０１０１６７５１９",
    "SΑ0380000000608010167519",
  ] as const;

  it("rejects every non-string without coercion", () => {
    for (const value of nonStringInputs) {
      expectFailure(validateSaudiIban(value), "INVALID_TYPE");
      expect(isSaudiIban(value)).toBe(false);
    }
  });

  it.each(adversarialStrings)("rejects adversarial canonical input %#", (value) => {
    expect(validateSaudiIban(value).valid).toBe(false);
    expect(isSaudiIban(value)).toBe(false);
  });

  it("keeps the boolean and detailed validators equivalent", () => {
    for (const value of [
      ...nonStringInputs,
      ...adversarialStrings,
      REFERENCE_SAUDI_IBAN,
      SYNTHETIC_SAUDI_IBAN,
      VALID_NON_SAUDI_IBAN,
      mutateCharacter(REFERENCE_SAUDI_IBAN, 3),
    ]) {
      expect(isSaudiIban(value)).toBe(validateSaudiIban(value).valid);
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

    expect(validateSaudiIban(input)).toEqual(validateSaudiIban(input));
    expect(validateSaudiIban(input)).toEqual({ valid: false, code: "INVALID_TYPE" });
    expect(normalizeIban(input)).toBeNull();
    expect(formatIban(input)).toBeNull();
    expect(coercionAccessed).not.toHaveBeenCalled();
    expect(Object.isFrozen(input)).toBe(true);
  });

  it("rejects an extremely long input before checksum work", () => {
    const input = "S".repeat(1024 * 1024);

    expectFailure(validateSaudiIban(input), "INVALID_LENGTH");
    expect(isSaudiIban(input)).toBe(false);
    expect(normalizeIban(input)).toBe(input);
    expect(formatIban(input)).toBeNull();
  });
});

/// <reference types="vite/client" />

import { describe, expect, it, vi } from "vitest";

import * as publicApi from "../src/index.js";
import type {
  NationalAddress,
  NationalAddressValidationResult,
  NormalizedSaudiPhone,
  ValidationErrorCode,
  ValidationEvidence,
  ValidationResult,
} from "../src/index.js";

const EXPECTED_RUNTIME_EXPORTS = [
  "formatIban",
  "getSaudiIdType",
  "isAdditionalNumber",
  "isBorderId",
  "isBuildingNumber",
  "isCommercialRegistration",
  "isIqama",
  "isLandlineNumber",
  "isMobileNumber",
  "isNationalId",
  "isPostalCode",
  "isSaudiIban",
  "isSaudiId",
  "isShortAddress",
  "isTin",
  "isTollFreeNumber",
  "isUnifiedNationalNumber",
  "isVatNumber",
  "normalizeAndValidateIban",
  "normalizeAndValidatePhoneNumber",
  "normalizeAndValidateShortAddress",
  "normalizeIban",
  "normalizePhoneNumber",
  "normalizeShortAddress",
  "validateAdditionalNumber",
  "validateBorderId",
  "validateBuildingNumber",
  "validateCommercialRegistration",
  "validateIqama",
  "validateLandlineNumber",
  "validateMobileNumber",
  "validateNationalAddress",
  "validateNationalIdDetailed",
  "validateIqamaDetailed",
  "validateSaudiIdDetailed",
  "validateBorderIdDetailed",
  "validateSaudiIbanDetailed",
  "validateVatNumberDetailed",
  "validateTinDetailed",
  "validateUnifiedNationalNumberDetailed",
  "validateCommercialRegistrationDetailed",
  "validateMobileNumberDetailed",
  "validateLandlineNumberDetailed",
  "validateTollFreeNumberDetailed",
  "validatePostalCodeDetailed",
  "validateBuildingNumberDetailed",
  "validateAdditionalNumberDetailed",
  "validateShortAddressDetailed",
  "validateNationalAddressDetailed",
  "validateNationalId",
  "validatePostalCode",
  "validateSaudiIban",
  "validateSaudiId",
  "validateShortAddress",
  "validateTin",
  "validateTollFreeNumber",
  "validateUnifiedNationalNumber",
  "validateVatNumber",
] as const;

const packageSources = import.meta.glob("../package.json", {
  eager: true,
  import: "default",
  query: "?raw",
});
const packageSource = Object.values(packageSources)[0];

if (packageSource === undefined) {
  throw new Error("package.json source was not loaded");
}

const packageJson = JSON.parse(packageSource) as {
  dependencies?: Record<string, unknown>;
  exports: unknown;
  sideEffects: unknown;
  type: unknown;
};
const runtimeFiles = Object.values(
  import.meta.glob("../src/**/*.ts", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
).join("\n");

describe("public package surface", () => {
  it("exports exactly the frozen V1 runtime API", () => {
    expect(Object.keys(publicApi).sort()).toEqual([...EXPECTED_RUNTIME_EXPORTS].sort());
    expect("default" in publicApi).toBe(false);
  });

  it("keeps the approved public types available from the root", () => {
    const witnesses: [
      ValidationErrorCode,
      ValidationResult,
      ValidationEvidence,
      NormalizedSaudiPhone,
      NationalAddress,
      NationalAddressValidationResult,
    ] = [
      "INVALID_FORMAT",
      { valid: true, value: "canonical" },
      "official-structural",
      { kind: "mobile", value: "+966501234567" },
      {
        buildingNumber: "1234",
        street: "Street",
        district: "District",
        city: "City",
        postalCode: "12345",
        additionalNumber: "6789",
      },
      { valid: false, code: "REQUIRED" },
    ];

    expect(witnesses).toHaveLength(6);
  });

  it("publishes one side-effect-free ESM root with no runtime dependencies", () => {
    expect(packageJson.type).toBe("module");
    expect(packageJson.sideEffects).toBe(false);
    expect(packageJson.exports).toEqual({
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
    });
    expect(Object.keys(packageJson.dependencies ?? {})).toEqual([]);
  });

  it("imports without logging or mutating the global surface", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const before = new Set(Reflect.ownKeys(globalThis));

    vi.resetModules();
    await import("../src/index.js");

    expect(Reflect.ownKeys(globalThis).filter((key) => !before.has(key))).toEqual([]);
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("keeps runtime code browser-safe and free of unsafe whole-value conversion", () => {
    expect(runtimeFiles).not.toMatch(/from ["']node:/);
    expect(runtimeFiles).not.toContain("BigInt(");
    expect(runtimeFiles).not.toMatch(/\b(?:Number|parseInt|parseFloat)\s*\(/);
  });

  it("keeps every production regex anchored and structurally simple", () => {
    const regexes = runtimeFiles.match(/\/\^[^/\n]*\/[a-z]*/g) ?? [];

    expect(regexes).toHaveLength(6);
    expect(regexes.filter((pattern) => !pattern.includes("$/"))).toEqual(["/^01[123467]/"]);
    for (const pattern of regexes) {
      expect(pattern).not.toMatch(/\.\*[+?]?|\.\+[+?]?|\\[1-9]|\(\?[=!<]/);
    }
  });
});

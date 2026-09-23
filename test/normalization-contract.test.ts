import { describe, expect, it } from "vitest";

import * as publicApi from "../src/index.js";

type NormalizerName = Exclude<
  Extract<keyof typeof publicApi, `normalize${string}`>,
  `normalizeAndValidate${string}`
>;

type ContractCase = {
  input: unknown;
  canonical: string;
  nonNormalizable: unknown;
  domainInvalidInput: unknown;
  domainInvalidCanonical: string;
  validate: (value: unknown) => { valid: boolean };
};

const cases = {
  normalizeIban: {
    input: "sa03 8000 0000 6080 1016 7519",
    canonical: "SA0380000000608010167519",
    nonNormalizable: "SA03-8000-0000-6080-1016-7519",
    domainInvalidInput: "sa03 8000 0000 6080 1016 7518",
    domainInvalidCanonical: "SA0380000000608010167518",
    validate: publicApi.validateSaudiIban,
  },
  normalizePhoneNumber: {
    input: "0501234567",
    canonical: "+966501234567",
    nonNormalizable: "050-123-4567",
    domainInvalidInput: "0601234567",
    domainInvalidCanonical: "+966601234567",
    validate: publicApi.validateMobileNumber,
  },
  normalizeShortAddress: {
    input: "abcd 0123",
    canonical: "ABCD0123",
    nonNormalizable: "abcd-0123",
    domainInvalidInput: "abcd 12",
    domainInvalidCanonical: "ABCD12",
    validate: publicApi.validateShortAddress,
  },
} satisfies Record<NormalizerName, ContractCase>;

describe("public standalone normalizer contract", () => {
  it("has a case for every exported normalizeX function", () => {
    const exported = Object.keys(publicApi).filter((name) =>
      /^normalize(?!AndValidate)[A-Z]/.test(name),
    );
    expect(exported.sort()).toEqual(Object.keys(cases).sort());
  });

  it.each(Object.entries(cases))(
    "%s returns a canonical string or null without validating",
    (name, testCase) => {
      const normalizer = publicApi[name as NormalizerName];
      const result: string | null = normalizer(testCase.input);

      expect(result).toBe(testCase.canonical);
      expect(typeof result).toBe("string");
      expect(normalizer(result)).toBe(result);
      expect(normalizer(testCase.nonNormalizable)).toBeNull();

      const invalidCandidate: string | null = normalizer(testCase.domainInvalidInput);
      expect(invalidCandidate).toBe(testCase.domainInvalidCanonical);
      expect(typeof invalidCandidate).toBe("string");
      expect(testCase.validate(invalidCandidate).valid).toBe(false);
    },
  );
});

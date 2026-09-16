export type ValidationErrorCode =
  | "REQUIRED"
  | "INVALID_TYPE"
  | "INVALID_LENGTH"
  | "INVALID_FORMAT"
  | "INVALID_PREFIX"
  | "INVALID_CHECKSUM";

export type ValidationResult =
  | {
      valid: true;
      value: string;
    }
  | {
      valid: false;
      code: ValidationErrorCode;
    };

export type ValidationEvidence =
  | "official-checksum"
  | "official-structural"
  | "official-structural-community-checksum"
  | "best-known-structural";

export type NormalizedSaudiPhone =
  | {
      kind: "mobile" | "landline";
      value: `+966${string}`;
    }
  | {
      kind: "toll-free";
      value: `800${string}`;
    };

export type NationalAddress = {
  buildingNumber: string;
  street: string;
  district: string;
  city: string;
  postalCode: string;
  additionalNumber: string;
};

export type NationalAddressValidationResult =
  | {
      valid: true;
      value: NationalAddress;
    }
  | {
      valid: false;
      code: ValidationErrorCode;
    };

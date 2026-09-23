/** Stable reason for a failed offline validation, ordered from missing input through checksum failure. */
export type ValidationErrorCode =
  | "REQUIRED"
  | "INVALID_TYPE"
  | "INVALID_LENGTH"
  | "INVALID_FORMAT"
  | "INVALID_PREFIX"
  | "INVALID_CHECKSUM";

/** A valid canonical input or a deterministic error code; validation never normalizes the input. */
export type ValidationResult =
  | {
      valid: true;
      value: string;
    }
  | {
      valid: false;
      code: ValidationErrorCode;
    };

/** A validated value or a stable error code with a short, consumer-facing explanation. */
export type DetailedValidationResult<T = string> =
  | { valid: true; value: T }
  | { valid: false; code: ValidationErrorCode; message: string; normalizedValue?: string };

/** Documentation-only strength of evidence behind a validation rule; not returned at runtime. */
export type ValidationEvidence =
  | "official-checksum"
  | "official-structural"
  | "official-structural-community-checksum"
  | "best-known-structural";

/** Validated combined phone result and its kind: E.164 for mobile/landline, national form for toll-free. */
export type NormalizedSaudiPhone =
  | {
      kind: "mobile" | "landline";
      value: `+966${string}`;
    }
  | {
      kind: "toll-free";
      value: `800${string}`;
    };

/** Required Saudi National Address fields; structural validation does not prove an address exists. */
export type NationalAddress = {
  buildingNumber: string;
  street: string;
  district: string;
  city: string;
  postalCode: string;
  additionalNumber: string;
};

/** A structurally valid address object or the first deterministic validation error. */
export type NationalAddressValidationResult =
  | {
      valid: true;
      value: NationalAddress;
    }
  | {
      valid: false;
      code: ValidationErrorCode;
    };

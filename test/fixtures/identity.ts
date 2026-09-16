/**
 * Synthetic checksum fixtures derived from the approved alternating-double rule.
 * They are test data only and make no claim of issuance or association with a person.
 */
export const SYNTHETIC_NATIONAL_IDS = ["1000000008", "1000000040"] as const;
export const SYNTHETIC_IQAMAS = ["2000000006", "2000000030"] as const;

export const INVALID_NATIONAL_ID_CHECKSUMS = ["1000000007", "1000000041"] as const;
export const INVALID_IQAMA_CHECKSUMS = ["2000000007", "2000000031"] as const;

/** Structurally valid synthetic Border IDs; no checksum is defined or inferred. */
export const SYNTHETIC_BORDER_IDS = ["3000000000", "4000000000"] as const;

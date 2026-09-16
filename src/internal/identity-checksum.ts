import { isAsciiDigits } from "./ascii.js";

/** Precondition: value is an already structurally validated 10-digit ASCII string. */
export function hasValidSaudiIdentityChecksum(value: string): boolean {
  if (typeof value !== "string" || value.length !== 10 || !isAsciiDigits(value)) {
    throw new TypeError("Saudi identity checksum requires exactly 10 ASCII digits");
  }

  let total = 0;

  for (let index = 0; index < value.length; index += 1) {
    const digit = value.charCodeAt(index) - 48;

    if (index % 2 === 0) {
      const doubled = digit * 2;
      total += doubled > 9 ? doubled - 9 : doubled;
    } else {
      total += digit;
    }
  }

  return total % 10 === 0;
}

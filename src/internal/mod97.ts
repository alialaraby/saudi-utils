import { isAsciiDigits } from "./ascii.js";

/** Precondition: value is a non-empty string containing only ASCII digits. */
export function mod97(value: string): number {
  if (typeof value !== "string" || !isAsciiDigits(value)) {
    throw new TypeError("mod97 requires a non-empty ASCII numeric string");
  }

  let remainder = 0;

  for (let index = 0; index < value.length; index += 1) {
    const digit = value.charCodeAt(index) - 48;
    remainder = (remainder * 10 + digit) % 97;
  }

  return remainder;
}

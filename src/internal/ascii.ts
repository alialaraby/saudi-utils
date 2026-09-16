const ASCII_DIGITS = /^[0-9]+$/;
const UPPERCASE_ASCII_ALPHANUMERIC = /^[A-Z0-9]+$/;

export function isAsciiDigits(value: string): boolean {
  return ASCII_DIGITS.test(value);
}

export function isUppercaseAsciiAlphanumeric(value: string): boolean {
  return UPPERCASE_ASCII_ALPHANUMERIC.test(value);
}

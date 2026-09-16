const throwingCoercionInput = Object.freeze(
  Object.defineProperties(
    {},
    {
      [Symbol.toPrimitive]: {
        get(): never {
          throw new Error("Symbol.toPrimitive getter must not be invoked");
        },
      },
      toString: {
        get(): never {
          throw new Error("toString getter must not be invoked");
        },
      },
      valueOf: {
        get(): never {
          throw new Error("valueOf getter must not be invoked");
        },
      },
    },
  ),
);

export const REQUIRED_INPUTS = [undefined, null, ""] as const;

export const NON_STRING_INPUTS = [
  0,
  42,
  1n,
  Number.NaN,
  Number.POSITIVE_INFINITY,
  true,
  Symbol("adversarial"),
  () => "1234",
  {},
  [],
  new String("1234"),
  throwingCoercionInput,
] as const;

export const ADVERSARIAL_STRINGS = [
  " ",
  " 1234",
  "1234 ",
  "12 34",
  "12-34",
  "12_34",
  "12/34",
  "12.34",
  "(1234)",
  "12\u00a034",
  "12\u200b34",
  "12\u200c34",
  "12\u200d34",
  "12\u200e34",
  "12\u200f34",
  "12\u202a34",
  "12\u202e34",
  "12\u202c34",
  "12\n34",
  "12\r\n34",
  "12\t34",
  "١٢٣٤٥٦٧٨٩٠",
  "۱۲۳۴۵۶۷۸۹۰",
  "１２３４５６７８９０",
  "12٣4567890",
  "1O00000008",
  "SΑ0380000000608010167519",
  "АBCD1234",
  "0",
  "0".repeat(25),
] as const;

export const ONE_MIB_ASCII = "9".repeat(1024 * 1024);
export const ONE_MIB_PUNCTUATION = "(".repeat(1024 * 1024);

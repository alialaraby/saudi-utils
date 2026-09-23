import {
  formatIban,
  getSaudiIdType,
  normalizeIban,
  normalizePhoneNumber,
  normalizeShortAddress,
  validateBorderId,
  validateMobileNumber,
  validateNationalAddress,
  validateNationalId,
  validateSaudiIban,
  validateTin,
  validateUnifiedNationalNumber,
  validateVatNumber,
} from "../dist/index.js";

function expectEqual(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

const iban = normalizeIban("sa03 8000 0000 6080 1016 7519");

expectEqual(getSaudiIdType("1000000008"), "national-id");
expectEqual(validateNationalId("1000000008"), {
  valid: true,
  value: "1000000008",
});
expectEqual(validateBorderId("3000000000"), {
  valid: true,
  value: "3000000000",
});
expectEqual(iban, "SA0380000000608010167519");
expectEqual(validateSaudiIban(iban), { valid: true, value: iban });
expectEqual(formatIban(iban), "SA03 8000 0000 6080 1016 7519");
expectEqual(formatIban("sa03 8000 0000 6080 1016 7519"), null);
expectEqual(validateVatNumber("300000000000003").valid, true);
expectEqual(validateTin("0123456789").valid, true);
expectEqual(validateUnifiedNationalNumber("7123456789").valid, true);
expectEqual(validateMobileNumber("0501234567").valid, true);
expectEqual(normalizePhoneNumber("0501234567"), "+966501234567");
expectEqual(normalizeShortAddress("abcd 0123"), "ABCD0123");
expectEqual(
  validateNationalAddress({
    buildingNumber: "0123",
    street: "King Fahd Road",
    district: "Al Olaya",
    city: "Riyadh",
    postalCode: "01234",
    additionalNumber: "0000",
    ignored: "extra properties are not copied",
  }),
  {
    valid: true,
    value: {
      buildingNumber: "0123",
      street: "King Fahd Road",
      district: "Al Olaya",
      city: "Riyadh",
      postalCode: "01234",
      additionalNumber: "0000",
    },
  },
);

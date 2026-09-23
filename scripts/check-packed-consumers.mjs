import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = mkdtempSync(resolve(tmpdir(), "saudi-utils-consumers-"));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });

  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exitCode = result.status ?? 1;
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

try {
  const packResult = spawnSync(
    npmCommand,
    ["pack", "--json", "--pack-destination", temporaryRoot],
    { cwd: repositoryRoot, encoding: "utf8" },
  );

  if (packResult.status !== 0) {
    process.stderr.write(packResult.stderr);
    throw new Error("npm pack failed");
  }

  const [packed] = JSON.parse(packResult.stdout);

  if (packed?.filename === undefined) {
    throw new Error("npm pack did not return a tarball filename");
  }

  const tarball = resolve(temporaryRoot, packed.filename);
  const esmDirectory = resolve(temporaryRoot, "esm");
  mkdirSync(esmDirectory);
  writeFileSync(
    resolve(esmDirectory, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  writeFileSync(
    resolve(esmDirectory, "index.mjs"),
    `import assert from "node:assert/strict";
import * as saudiUtils from "saudi-utils";

const expectedRuntimeExports = ${JSON.stringify(
      [
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
      ].sort(),
    )};

assert.deepEqual(Object.keys(saudiUtils).sort(), expectedRuntimeExports);
assert.equal(saudiUtils.validateNationalId("1000000008").valid, true);
assert.deepEqual(saudiUtils.validateNationalIdDetailed("bad"), { valid: false, code: "INVALID_LENGTH", message: "National ID has an invalid length." });
assert.equal(saudiUtils.normalizeIban("sa03 8000 0000 6080 1016 7519"), "SA0380000000608010167519");
assert.equal(saudiUtils.validateVatNumber("300000000000003").valid, true);
assert.deepEqual(saudiUtils.normalizePhoneNumber("0501234567"), { kind: "mobile", value: "+966501234567" });
assert.equal(saudiUtils.normalizeShortAddress("abcd 0123"), "ABCD0123");
assert.equal(saudiUtils.validateNationalAddress({
  buildingNumber: "0123",
  street: "King Fahd Road",
  district: "Al Olaya",
  city: "Riyadh",
  postalCode: "01234",
  additionalNumber: "0000",
}).valid, true);
`,
  );
  run(
    npmCommand,
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
    esmDirectory,
  );
  run(process.execPath, ["index.mjs"], esmDirectory);

  const typesDirectory = resolve(temporaryRoot, "types");
  mkdirSync(typesDirectory);
  writeFileSync(
    resolve(typesDirectory, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  writeFileSync(
    resolve(typesDirectory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        exactOptionalPropertyTypes: true,
        module: "NodeNext",
        moduleResolution: "NodeNext",
        noEmit: true,
        noUncheckedIndexedAccess: true,
        strict: true,
        target: "ES2022",
      },
      include: ["index.ts"],
    }),
  );
  writeFileSync(
    resolve(typesDirectory, "index.ts"),
    `import {
  formatIban, getSaudiIdType, isAdditionalNumber, isBorderId, isBuildingNumber,
  isCommercialRegistration, isIqama, isLandlineNumber, isMobileNumber, isNationalId,
  isPostalCode, isSaudiIban, isSaudiId, isShortAddress, isTin, isTollFreeNumber,
  isUnifiedNationalNumber, isVatNumber, normalizeIban, normalizePhoneNumber,
  normalizeShortAddress, validateAdditionalNumber, validateBorderId, validateBuildingNumber,
  validateCommercialRegistration, validateIqama, validateLandlineNumber, validateMobileNumber,
  validateNationalAddress, validateNationalId, validatePostalCode, validateSaudiIban,
  validateSaudiId, validateShortAddress, validateTin, validateTollFreeNumber,
  validateUnifiedNationalNumber, validateVatNumber,
  type NationalAddress, type NationalAddressValidationResult, type NormalizedSaudiPhone,
  type ValidationErrorCode, type ValidationEvidence, type ValidationResult,
  type DetailedValidationResult, validateNationalAddressDetailed, validateSaudiIbanDetailed,
} from "saudi-utils";

const address: NationalAddress = {
  buildingNumber: "0123", street: "King Fahd Road", district: "Al Olaya",
  city: "Riyadh", postalCode: "01234", additionalNumber: "0000",
};
const result: NationalAddressValidationResult = validateNationalAddress(address);
const phone: NormalizedSaudiPhone | null = normalizePhoneNumber("0501234567");
const error: ValidationErrorCode = "INVALID_FORMAT";
const evidence: ValidationEvidence = "official-structural";
const validation: ValidationResult = validateSaudiIban("SA0380000000608010167519");
const detailed: DetailedValidationResult = validateSaudiIbanDetailed("bad");
const detailedAddress: DetailedValidationResult<NationalAddress> = validateNationalAddressDetailed(address);

void [
  address, result, phone, error, evidence, validation, detailed, detailedAddress, formatIban, getSaudiIdType,
  isAdditionalNumber, isBorderId, isBuildingNumber, isCommercialRegistration, isIqama,
  isLandlineNumber, isMobileNumber, isNationalId, isPostalCode, isSaudiIban, isSaudiId,
  isShortAddress, isTin, isTollFreeNumber, isUnifiedNationalNumber, isVatNumber, normalizeIban,
  normalizeShortAddress, validateAdditionalNumber, validateBorderId, validateBuildingNumber,
  validateCommercialRegistration, validateIqama, validateLandlineNumber, validateMobileNumber,
  validateNationalId, validatePostalCode, validateSaudiId, validateShortAddress, validateTin,
  validateTollFreeNumber, validateUnifiedNationalNumber, validateVatNumber,
];
`,
  );
  run(
    npmCommand,
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
    typesDirectory,
  );
  run(
    process.execPath,
    [resolve(repositoryRoot, "node_modules/typescript/bin/tsc"), "--project", "tsconfig.json"],
    typesDirectory,
  );

  const manifest = JSON.parse(
    readFileSync(resolve(typesDirectory, "node_modules/saudi-utils/package.json"), "utf8"),
  );
  if (Object.keys(manifest.dependencies ?? {}).length !== 0) {
    throw new Error("Packed package has runtime dependencies");
  }

  console.log("Packed ESM runtime and strict TypeScript consumers passed.");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}

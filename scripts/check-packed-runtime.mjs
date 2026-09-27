import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const tarball = process.argv[2];
if (!tarball) throw new Error("Provide the path to a packed saudi-utils tarball");

const consumer = mkdtempSync(resolve(tmpdir(), "saudi-utils-runtime-"));
try {
  writeFileSync(
    resolve(consumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const install = spawnSync(
    npm,
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", resolve(tarball)],
    { cwd: consumer, encoding: "utf8" },
  );
  assert.equal(install.status, 0, install.stderr);

  writeFileSync(
    resolve(consumer, "check.mjs"),
    `import assert from "node:assert/strict";
import {
  canonicalizeIban, canonicalizePhoneNumber, canonicalizeShortAddress,
  normalizeIban, normalizePhoneNumber, normalizeShortAddress,
  normalizeAndValidateIban, validateSaudiIbanDetailed,
} from "saudi-utils";
assert.equal(canonicalizeIban("sa03 8000 0000 6080 1016 7518"), "SA0380000000608010167518");
assert.equal(normalizeIban("sa03 8000 0000 6080 1016 7518"), null);
assert.equal(canonicalizePhoneNumber("0501234567"), "+966501234567");
assert.deepEqual(normalizePhoneNumber("0501234567"), { kind: "mobile", value: "+966501234567" });
assert.equal(canonicalizeShortAddress("abcd 12"), "ABCD12");
assert.equal(normalizeShortAddress("abcd 12"), null);
assert.deepEqual(validateSaudiIbanDetailed("SA0380000000608010167518"), {
  valid: false, code: "INVALID_CHECKSUM", message: "Saudi IBAN has an invalid checksum."
});
assert.equal(normalizeAndValidateIban("sa03 8000 0000 6080 1016 7518").valid, false);
`,
  );
  const runtime = spawnSync(process.execPath, [resolve(consumer, "check.mjs")], {
    cwd: consumer,
    encoding: "utf8",
  });
  assert.equal(runtime.status, 0, runtime.stderr);
  console.log(`Packed runtime consumer passed on ${process.version}.`);
} finally {
  rmSync(consumer, { recursive: true, force: true });
}

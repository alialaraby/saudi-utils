import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npmCommand, ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
});

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

const [packResult] = JSON.parse(result.stdout);

if (packResult === undefined || !Array.isArray(packResult.files)) {
  throw new Error("npm pack did not return the expected file manifest");
}

const paths = packResult.files.map((file) => file.path);
const requiredPaths = ["LICENSE", "README.md", "dist/index.d.ts", "dist/index.js", "package.json"];
const allowedDistFile = /^dist\/.+\.(?:d\.ts|d\.ts\.map|js|js\.map)$/;
const unexpectedPaths = paths.filter(
  (path) => !requiredPaths.includes(path) && !allowedDistFile.test(path),
);
const missingPaths = requiredPaths.filter((path) => !paths.includes(path));
const packedLimit = 50 * 1024;
const unpackedLimit = 250 * 1024;
const sizeFailures = [
  packResult.size > packedLimit
    ? `Packed size ${packResult.size} exceeds ${packedLimit} bytes`
    : "",
  packResult.unpackedSize > unpackedLimit
    ? `Unpacked size ${packResult.unpackedSize} exceeds ${unpackedLimit} bytes`
    : "",
].filter(Boolean);

if (unexpectedPaths.length > 0 || missingPaths.length > 0 || sizeFailures.length > 0) {
  throw new Error(
    [
      unexpectedPaths.length > 0 ? `Unexpected packed files: ${unexpectedPaths.join(", ")}` : "",
      missingPaths.length > 0 ? `Missing packed files: ${missingPaths.join(", ")}` : "",
      ...sizeFailures,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

console.log(
  `Packed file manifest is limited to ${paths.length} intended files ` +
    `(${packResult.size} bytes packed, ${packResult.unpackedSize} bytes unpacked).`,
);

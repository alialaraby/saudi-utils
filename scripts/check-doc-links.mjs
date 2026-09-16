import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([".git", "coverage", "dist", "node_modules"]);

function collectMarkdownFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) {
      continue;
    }

    const path = resolve(directory, entry);

    if (statSync(path).isDirectory()) {
      files.push(...collectMarkdownFiles(path));
    } else if (extname(path) === ".md") {
      files.push(path);
    }
  }

  return files;
}

const failures = [];
const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^)]*)?\)/g;

for (const markdownFile of collectMarkdownFiles(repositoryRoot)) {
  const source = readFileSync(markdownFile, "utf8");

  for (const match of source.matchAll(linkPattern)) {
    const rawTarget = match[1];

    if (
      rawTarget === undefined ||
      rawTarget.startsWith("#") ||
      /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)
    ) {
      continue;
    }

    const target = rawTarget.replace(/^<|>$/g, "").split("#", 1)[0];

    if (target === undefined || !existsSync(resolve(dirname(markdownFile), decodeURI(target)))) {
      failures.push(`${markdownFile.slice(repositoryRoot.length + 1)} -> ${rawTarget}`);
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Broken local Markdown links:\n${failures.join("\n")}`);
}

console.log("All local Markdown links resolve.");

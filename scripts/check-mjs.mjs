#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const pluginsRoot = join(repoRoot, "plugins");

/**
 * @param {string} dir
 * @returns {string[]}
 */
function findMjsFiles(dir) {
  /** @type {string[]} */
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMjsFiles(absPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".mjs")) {
      files.push(absPath);
    }
  }

  return files;
}

const mjsFiles = findMjsFiles(pluginsRoot).sort();

if (mjsFiles.length === 0) {
  console.log("No .mjs files found under plugins/.");
  process.exit(0);
}

let failed = false;

for (const filePath of mjsFiles) {
  const displayPath = relative(repoRoot, filePath).replace(/\\/g, "/");
  try {
    execFileSync(process.execPath, ["--check", filePath], { stdio: "pipe" });
    console.log(`OK ${displayPath}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${displayPath}`);
    if (error instanceof Error && "stderr" in error && error.stderr) {
      process.stderr.write(String(error.stderr));
    } else if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Checked ${mjsFiles.length} .mjs files.`);
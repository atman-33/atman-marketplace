#!/usr/bin/env node
// @ts-check
/**
 * SessionStart hook: inject registered project paths and the openspec docs
 * folder path into Claude's context as a <project-context> XML block, and
 * optionally the role-based delegation criteria as a <role-based-delegation>
 * block (when `roleBasedDelegation: true` is set in the config).
 *
 * Reads `<project-root>/.claude/project-context.json` and emits
 * `hookSpecificOutput.additionalContext`. Runs identically on Windows and
 * WSL/macOS because it is launched via `node` (no platform-specific wrapper).
 *
 * Behaviour:
 *   - No config file        -> emit nothing (don't nag unconfigured projects).
 *   - Malformed config       -> emit a short error note so the user can fix it.
 *   - Valid config           -> emit the <project-context> block and/or the
 *                               <role-based-delegation> block, as configured.
 * Always exits 0 (SessionStart cannot block and hooks must be failure-tolerant).
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CONFIG_RELATIVE_PATH = ".claude/project-context.json";

// Delegation-criteria doc shipped alongside the hook (../role-based-model-selection.md).
const DELEGATION_DOC_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "role-based-model-selection.md"
);

/** Read all of stdin (the SessionStart payload). Returns "" if none. */
function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

/** Escape a string for use in XML text or a double-quoted attribute. */
function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Print a SessionStart hook result and exit 0.
 *
 * When there is content to inject, the same text is also surfaced to the user
 * via the top-level `systemMessage` field (verbatim), so it is visible in the
 * transcript and the user can confirm exactly what was injected. `systemMessage`
 * is display-only; `additionalContext` is what Claude actually receives.
 */
function emit(additionalContext) {
  const payload = additionalContext
    ? {
        systemMessage: additionalContext,
        hookSpecificOutput: {
          hookEventName: "SessionStart",
          additionalContext,
        },
      }
    : {};
  process.stdout.write(JSON.stringify(payload));
  process.exit(0);
}

/** Resolve the project root from env, then the stdin payload, then cwd. */
function resolveProjectRoot(stdinRaw) {
  if (process.env.CLAUDE_PROJECT_DIR) {
    return process.env.CLAUDE_PROJECT_DIR;
  }
  if (stdinRaw.trim()) {
    try {
      const payload = JSON.parse(stdinRaw);
      if (payload && typeof payload.cwd === "string" && payload.cwd) {
        return payload.cwd;
      }
    } catch {
      // ignore malformed stdin; fall through to cwd
    }
  }
  return process.cwd();
}

/** Build the <project-context> XML block from the parsed config. */
function buildXml(config) {
  const lines = ["<project-context>"];

  if (typeof config.openspecPath === "string" && config.openspecPath.trim()) {
    lines.push(`  <openspec path="${xmlEscape(config.openspecPath.trim())}" />`);
  }

  const projects = Array.isArray(config.projects) ? config.projects : [];
  const validProjects = projects.filter(
    (p) => p && typeof p.path === "string" && p.path.trim()
  );

  if (validProjects.length > 0) {
    lines.push("  <registered-projects>");
    for (const project of validProjects) {
      const name =
        typeof project.name === "string" && project.name.trim()
          ? project.name.trim()
          : project.path.trim();
      const summary =
        typeof project.summary === "string" && project.summary.trim()
          ? project.summary.trim()
          : "";
      const attrs = `name="${xmlEscape(name)}" path="${xmlEscape(project.path.trim())}"`;
      if (summary) {
        lines.push(`    <project ${attrs}>`);
        lines.push(`      <summary>${xmlEscape(summary)}</summary>`);
        lines.push("    </project>");
      } else {
        lines.push(`    <project ${attrs} />`);
      }
    }
    lines.push("  </registered-projects>");
  }

  lines.push("</project-context>");
  return lines.join("\n");
}

/**
 * Read the shipped delegation-criteria doc and wrap it in a
 * <role-based-delegation> block. Returns null (and injects nothing) if the file
 * can't be read, since the hook must be failure-tolerant.
 */
function buildDelegationBlock() {
  let doc;
  try {
    doc = readFileSync(DELEGATION_DOC_PATH, "utf8").trim();
  } catch {
    return null;
  }
  if (!doc) {
    return null;
  }
  return `<role-based-delegation>\n${doc}\n</role-based-delegation>`;
}

function main() {
  const stdinRaw = readStdin();
  const projectRoot = resolveProjectRoot(stdinRaw);
  const configPath = join(projectRoot, CONFIG_RELATIVE_PATH);

  let raw;
  try {
    raw = readFileSync(configPath, "utf8");
  } catch {
    // No config file for this project: inject nothing.
    emit(null);
    return;
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch (error) {
    emit(
      `<project-context>\n  <error>Failed to parse ${xmlEscape(CONFIG_RELATIVE_PATH)}: ${xmlEscape(
        error instanceof Error ? error.message : String(error)
      )}. Please fix the JSON.</error>\n</project-context>`
    );
    return;
  }

  // Nothing useful configured -> inject nothing.
  const hasOpenspec =
    typeof config.openspecPath === "string" && config.openspecPath.trim();
  const hasProjects =
    Array.isArray(config.projects) &&
    config.projects.some((p) => p && typeof p.path === "string" && p.path.trim());
  const wantsDelegation = config.roleBasedDelegation === true;
  if (!hasOpenspec && !hasProjects && !wantsDelegation) {
    emit(null);
    return;
  }

  const blocks = [];
  if (hasOpenspec || hasProjects) {
    blocks.push(buildXml(config));
  }
  if (wantsDelegation) {
    const delegation = buildDelegationBlock();
    if (delegation) {
      blocks.push(delegation);
    }
  }

  emit(blocks.length > 0 ? blocks.join("\n\n") : null);
}

main();

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A Claude Code plugin marketplace. It contains reusable plugins (slash commands, sub-agents, hooks, MCP configs, and agent skills) that users install into Claude Code via the `/plugin` command. There is no build step, test suite, or package manager — content is plain Markdown and JSON.

## Repository layout

```
.claude-plugin/marketplace.json   # Marketplace manifest — lists every plugin
plugins/<plugin-name>/
  .claude-plugin/plugin.json      # Plugin manifest (name, version, description)
  commands/*.md                   # Slash commands (filename → /command-name)
  agents/*.md                     # Sub-agent definitions
  hooks/hooks.json                # Shell hooks (Windows native by default)
  .mcp.json                       # MCP server configuration
  skills/<skill-name>/SKILL.md    # Agent skill entry point
  skills/<skill-name>/GLOSSARY.md # (optional) definitions disclosed from SKILL.md
  skills/<skill-name>/REFERENCE.md# (optional) extended reference
  skills/<skill-name>/references/ # (optional) additional reference files
  README.md
```

## Plugin manifest rules

- `marketplace.json` → `plugins[].name` must exactly match the plugin folder name and `plugin.json` → `name`.
- When adding a new plugin, register it in both `.claude-plugin/marketplace.json` and create `plugins/<name>/.claude-plugin/plugin.json`.

## Skill authoring

Skills live in `plugins/<plugin>/skills/<skill-name>/SKILL.md` (and optionally sibling files). The frontmatter keys that matter:

| Key | Purpose |
|-----|---------|
| `name` | Skill identifier (kebab-case) |
| `description` | Used by the model to auto-invoke; omit or set `disable-model-invocation: true` for user-only skills |
| `disable-model-invocation: true` | Prevents model from auto-firing the skill; user must type its name |
| `argument-hint` | Prompt shown when the skill is invoked without arguments |
| `allowed-tools` | Restricts which tools the skill may use |
| `compatibility` | Documents hard runtime requirements (e.g. requires `gh`, Python, PowerShell) |

Skills use an information hierarchy: inline steps for actions the agent always needs, sibling `.md` files (linked via `[text](file.md)`) for reference the agent reaches only sometimes. See `.claude/skills/writing-great-skills/SKILL.md` for the full authoring reference.

## Command authoring

Command files in `commands/` become slash commands. Frontmatter:

```yaml
---
name: command-name          # maps to /command-name
description: …              # shown in UI; set disable-model-invocation: true for user-only
allowed-tools: Bash(…)      # optional tool restrictions
---
```

Use `$ARGUMENTS` for the full argument string, `$1`/`$2`/… for positional args.

## Current plugins

| Plugin | Contents |
|--------|----------|
| `engineering` | Skills: `commit-changes`, `create-feature-branch`, `create-pull-request`, `prepare-release`. Command: `install-recommended-skills` (installs mattpocock/skills engineering set via `gh skill install`) |
| `productivity` | Skills: `install-skill`, `claude-code-commands`. Command: `install-recommended-skills` (installs mattpocock/skills productivity set) |
| `scrum` | Placeholder — MCP config only, no commands/skills yet |
| `obsidian` | Placeholder — MCP config only, no commands/skills yet |
| `stack-cloudflare` | Skill: `cloudflare-static-assets` (static asset utility pattern for React Router on Cloudflare Workers) |
| `stack-dnd-kit` | Skill: `dnd-kit-implementation` with reference files for patterns and state management |
| `stack-opencode` | Skill: `opencode-log-investigation` |
| `stack-react-router` | Skill: `react-router-v7-app` |

## Windows / WSL

The repo targets both environments. Hooks default to native Windows variants. Skills and commands are environment-agnostic. Plugins with hook variants document both in their `README.md`; WSL users swap in the alternative `hooks/hooks.json`.

## Commit conventions

Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, etc.).

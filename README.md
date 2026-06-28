# atman-marketplace

> A personal Claude Code marketplace by [atman-33](https://github.com/atman-33) — reusable plugins (slash commands, sub-agents, hooks, MCP servers, and agent skills) installable in one command.

[![GitHub stars](https://img.shields.io/github/stars/atman-33/atman-marketplace.svg?style=flat-square)](https://github.com/atman-33/atman-marketplace/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/atman-33/atman-marketplace.svg?style=flat-square)](https://github.com/atman-33/atman-marketplace/issues)

## Overview

atman-marketplace extends Claude Code with ready-to-use plugins that cover the most common engineering and productivity workflows. Each plugin is a self-contained bundle of slash commands, sub-agents, hooks, MCP configs, and skills — just add the marketplace once and install what you need.

Plugins target both **native Windows** and **WSL** environments. Environment-agnostic assets (commands, agents, skills) work in both setups without changes. Hook variants for WSL are documented in each plugin's own README.

## Available Plugins

| Plugin | Description | Recommended Scope |
|--------|-------------|-------------------|
| `engineering` | Engineering utilities: role-based sub-agents, git workflow skills, project-context commands, MCP setup. | `project` |
| `productivity` | Productivity helpers: `/create-readme`, `/create-claude-md`, skill installer. | `user` |
| `obsidian` | Helpers for working with Obsidian notes and knowledge management. | `project` |
| `scrum` | Helpers for scrum and agile development workflows. | — |
| `stack-cloudflare` | Helpers for Cloudflare Workers, Pages, R2, D1, and related services. | — |
| `stack-dnd-kit` | Helpers for building drag-and-drop UIs with dnd kit. | — |
| `stack-opencode` | Helpers for OpenCode configuration and extensions. | — |
| `stack-react-router` | Helpers for React Router and Remix applications. | — |

## Getting Started

### Step 1 — Add this marketplace

**CLI:**

```bash
claude plugin marketplace add atman-33/atman-marketplace
```

Alternative source formats:

```bash
claude plugin marketplace add atman-33/atman-marketplace                         # GitHub shorthand
claude plugin marketplace add git@github.com:atman-33/atman-marketplace.git      # SSH
claude plugin marketplace add https://github.com/atman-33/atman-marketplace.git  # HTTPS
claude plugin marketplace add ./path/to/atman-marketplace                        # local clone
```

**Interactive UI:**

1. Open Claude Code and run `/plugin`.
2. Select **Marketplaces** → **Add Marketplace**.
3. Enter: `atman-33/atman-marketplace`
4. Select **atman-marketplace**, then **Browse plugins**.

### Step 2 — Install a plugin

**CLI:**

```bash
claude plugin install <plugin-name>@atman-marketplace [--scope user|project|local]
```

Scope defaults to `user` when omitted.

**Interactive UI:**

1. Run `/plugin` inside a Claude Code session.
2. Browse to the plugin under **atman-marketplace**.
3. Press **Enter** and choose a scope in the install dialog.

Or use the slash command form:

```
/plugin install <plugin-name> --scope user|project|local
```

### Installation Scopes

| Scope | Saved To | Shared with Team |
|-------|----------|-----------------|
| `user` | User settings (global) | No — personal only |
| `project` | `.claude/settings.json` (repo) | Yes — committed to git |
| `local` | `.claude/settings.local.json` (repo) | No — gitignored |

- **user** — Available across every project on your machine. Best for personal productivity plugins.
- **project** — Saved in the current repo so the whole team gets it. Use for project-specific tooling.
- **local** — Applied only to the current repo on your machine without touching git. Good for personal experiments.

### Recommended Install Commands

| Plugin | Recommended Scope | Command |
|--------|-------------------|---------|
| `engineering` | `project` | `claude plugin install engineering@atman-marketplace --scope project` |
| `productivity` | `user` | `claude plugin install productivity@atman-marketplace --scope user` |
| `obsidian` | `project` | `claude plugin install obsidian@atman-marketplace --scope project` |

> [!TIP]
> Install `productivity` at `user` scope first — it ships `/install-recommended-skills` which bootstraps the rest of your setup in one step.

## Managing Plugins

```bash
claude plugin list                                      # list installed plugins
claude plugin update <plugin-name>@atman-marketplace   # update to latest version
claude plugin uninstall <plugin-name>@atman-marketplace
```

## Repository Layout

```
atman-marketplace/
├─ .claude-plugin/
│  └─ marketplace.json          # Marketplace manifest
└─ plugins/
   └─ <plugin-name>/
      ├─ .claude-plugin/
      │  └─ plugin.json         # Plugin manifest (name, version, description)
      ├─ commands/*.md           # Slash commands (optional)
      ├─ agents/*.md             # Sub-agents (optional)
      ├─ hooks/hooks.json        # Hooks (optional)
      ├─ .mcp.json               # MCP server config (optional)
      ├─ skills/<name>/SKILL.md  # Agent skills (optional)
      └─ README.md
```

## Adding a New Plugin

1. Create `plugins/<plugin-name>/` and add a `.claude-plugin/plugin.json` manifest (see `plugins/scrum` as a minimal example).
2. Add whichever asset folders you need: `commands/`, `agents/`, `hooks/`, `.mcp.json`, `skills/`.
3. Register the plugin in `.claude-plugin/marketplace.json` under the `plugins` array (name must match `plugin.json`).
4. Commit and push. Re-run `/plugin` in Claude Code to refresh and install.

> [!NOTE]
> The committed `hooks/hooks.json` defaults to the native Windows variant. WSL users should swap in the WSL alternative documented in the plugin's own README.

## Resources

- [Claude Code Plugin System docs](https://docs.anthropic.com/en/docs/claude-code/plugins)
- [GitHub Repository](https://github.com/atman-33/atman-marketplace)

# atman-marketplace

A Claude Code marketplace maintained by [`atman-33`](https://github.com/atman-33).
It bundles reusable plugins (slash commands, sub-agents, hooks, MCP, agent skills)
that can be installed into Claude Code via the `/plugin` command.

## Adding this marketplace to Claude Code

1. Open Claude Code and run `/plugin`.
2. Select **Marketplaces** → **Add Marketplace**.
3. Enter the source: `atman-33/atman-marketplace`
4. Select **atman-marketplace**, then **Browse plugins**.

Alternative source formats are also supported:

```
atman-33/atman-marketplace                         (GitHub shorthand)
git@github.com:atman-33/atman-marketplace.git      (SSH)
https://github.com/atman-33/atman-marketplace.git  (HTTPS)
./path/to/atman-marketplace                        (local clone)
```

## Installing a plugin

After the marketplace is added, install any plugin with `/plugin`.

### Interactive UI

1. Run `/plugin`.
2. Browse to the plugin you want under **atman-marketplace**.
3. Press **Enter** on the plugin and choose a scope in the install dialog.

### Command line

Use `/plugin install <plugin-name>` with a `--scope` flag to choose where the
plugin is saved:

```
/plugin install engineering --scope user
/plugin install engineering --scope project
/plugin install engineering --scope local
```

### Installation scopes

| Scope | Saved To | Shared with Team |
|---|---|---|
| **user** | User settings (global) | No (personal only) |
| **project** | `.claude/settings.json` (in repo) | Yes (committed to git) |
| **local** | `.claude/settings.local.json` (in repo) | No (gitignored) |

- **user** — Makes the plugin available across every project on your machine.
- **project** — Saves the plugin in the current repository so the whole team
  can use it. Use this for project-specific tooling.
- **local** — Applies the plugin only to the current repository on your
  machine, without sharing it through git. Use this for personal experiments
  or overrides.

If you do not specify a scope, Claude Code installs the plugin in **user**
scope by default.

## Repository layout

```
atman-marketplace/
├─ .claude-plugin/
│  └─ marketplace.json          # Marketplace manifest (exactly one)
└─ plugins/
   └─ <plugin-name>/           # One directory per plugin
      ├─ .claude-plugin/
      │  └─ plugin.json        # Plugin manifest
      ├─ commands/*.md          # Custom slash commands (optional)
      ├─ agents/*.md            # Sub-agents (optional)
      ├─ hooks/hooks.json       # Hooks (optional)
      ├─ .mcp.json              # MCP servers (optional)
      ├─ skills/<name>/SKILL.md # Agent skills (optional)
      └─ README.md
```

## Adding a new plugin

1. Create `plugins/<plugin-name>/` and add a `.claude-plugin/plugin.json`
   manifest (see `plugins/sample` as a template).
2. Drop in whichever asset folders you need: `commands/`, `agents/`,
   `hooks/`, `.mcp.json`, `skills/`.
3. Register the plugin in `.claude-plugin/marketplace.json` under the
   `plugins` array (name must match `plugin.json`).
4. Commit and push. Re-open `/plugin` in Claude Code to refresh and install.

## Environment support

This marketplace targets both **native Windows** and **WSL** environments.

- Plugin assets that are environment-agnostic (commands, agents, skills) work
  in both setups without modification.
- Hooks are environment-specific. Each plugin that ships hooks documents both
  the Windows and WSL variants in its own `README.md`. The committed
  `hooks/hooks.json` defaults to the native Windows variant; WSL users should
  swap in the documented alternative when needed.

## Available plugins

| Plugin | Description |
| ------ | ----------- |
| `engineering` | Engineering utilities and helpers for software development tasks. |
| `scrum` | Helpers for scrum and agile development workflows. |
| `obsidian` | Helpers for working with Obsidian notes and knowledge management. |
| `productivity` | Productivity helpers for administrative and daily tasks. |
| `misc` | Miscellaneous utility skills for common Claude Code tasks. |
| `stack-cloudflare` | Helpers for developing on Cloudflare (Workers, Pages, R2, D1, etc.). |
| `stack-dnd-kit` | Helpers for building drag-and-drop UIs with dnd kit. |
| `stack-opencode` | Helpers for working with OpenCode configuration and extensions. |
| `stack-react-router` | Helpers for React Router and Remix applications. |

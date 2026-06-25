# atman-marketplace

A Claude Code marketplace maintained by [`atman-33`](https://github.com/atman-33).
It bundles reusable plugins (slash commands, sub-agents, hooks, MCP, agent skills)
that can be installed into Claude Code via the `/plugin` command.

## Adding this marketplace to Claude Code

1. Open Claude Code and run `/plugin`.
2. Select **Marketplaces** → **Add Marketplace**.
3. Enter the source: `atman-33/atman-marketplace`
4. Select **atman-marketplace**, then **Browse plugins**.
5. Pick the plugin you want and choose **Install for you (user scope)** so it
   applies to every project on your machine.

Alternative source formats are also supported:

```
atman-33/atman-marketplace                         (GitHub shorthand)
git@github.com:atman-33/atman-marketplace.git      (SSH)
https://github.com/atman-33/atman-marketplace.git  (HTTPS)
./path/to/atman-marketplace                        (local clone)
```

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
| `sample` | Starter plugin used as a template. Replace or extend with your own assets. |
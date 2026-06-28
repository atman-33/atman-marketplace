# atman-marketplace
Claude Code plugin marketplace — mostly plain Markdown and JSON, with a lightweight Node-based validation script for local checks. Content is installed into Claude Code via the `/plugin` command.

## Commands

- check: `npm run check`
- check:mjs: `npm run check:mjs`

## Layout

```
.claude-plugin/marketplace.json        # Marketplace manifest — lists every plugin
plugins/<name>/.claude-plugin/plugin.json  # Plugin manifest (name, version, description)
plugins/<name>/commands/*.md           # Slash commands (filename → /command-name)
plugins/<name>/agents/*.md             # Sub-agent definitions
plugins/<name>/hooks/hooks.json        # Shell hooks (Windows native by default)
plugins/<name>/.mcp.json               # MCP server configuration
plugins/<name>/skills/<skill>/SKILL.md # Agent skill entry point
```

## Workflow

- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- Windows/WSL: hooks default to native Windows; WSL users swap in the alternative `hooks/hooks.json` documented in each plugin's README.
- Run `npm run check:mjs` after changing any `.mjs` file; the root `package.json` is validation-only and has no dependencies.

<important>
- Always bump `plugins/<name>/.claude-plugin/plugin.json` → `version` whenever you change that plugin (commands, agents, hooks, MCP, skills, docs). Use semver: patch for fixes/docs, minor for new features, major for breaking changes. Users won't receive updates without this bump.
- `marketplace.json` → `plugins[].name` must exactly match the plugin folder name AND `plugin.json` → `name`.
- When adding a new plugin, register it in both `.claude-plugin/marketplace.json` AND create `plugins/<name>/.claude-plugin/plugin.json`.
</important>

# atman-marketplace
Claude Code plugin marketplace — mostly plain Markdown and JSON, with a lightweight Node-based validation script for local checks. Content is installed into Claude Code via the `/plugin` command.

## Commands

- check: `npm run check`
- check:mjs: `npm run check:mjs`

## Layout

```
.claude-plugin/marketplace.json        # Marketplace manifest — lists every plugin
plugins/<name>/.claude-plugin/plugin.json  # Plugin manifest (name, version, description)
plugins/<name>/agents/*.md             # Sub-agent definitions
plugins/<name>/hooks/hooks.json        # Shell hooks (Windows native by default)
plugins/<name>/.mcp.json               # MCP server configuration
plugins/<name>/skills/<skill>/SKILL.md # Agent skill entry point
```

## Commands vs Skills Policy

This marketplace uses skills exclusively — `plugins/<name>/commands/*.md` is no
longer used anywhere; every former command has been migrated to a
`plugins/<name>/skills/<skill>/SKILL.md`. A skill with
`disable-model-invocation: true` reproduces command behavior exactly — the
`description` is never injected into context and the body only loads when the
user explicitly types the skill name — while also allowing bundled reference
files in the skill folder. Author all new user-invocable, explicit-only
functionality as a skill; see `.claude/rules/skill-authoring.md`. Do not
recreate a `plugins/*/commands/` directory.

## Workflow

- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- Windows/WSL: hooks default to native Windows; WSL users swap in the alternative `hooks/hooks.json` documented in each plugin's README.
- Run `npm run check:mjs` after changing any `.mjs` file; the root `package.json` is validation-only and has no dependencies.

<important>
- Always bump `plugins/<name>/.claude-plugin/plugin.json` → `version` whenever you change that plugin (commands, agents, hooks, MCP, skills, docs). Use semver: patch for fixes/docs, minor for new features, major for breaking changes. Users won't receive updates without this bump.
- After bumping `plugin.json` → `version`, **also update the matching entry in `.claude-plugin/marketplace.json`** (`plugins[].version`) to the same value. The plugin system uses `plugin.json` for auto-update checks; `marketplace.json` is display metadata and must be kept in sync manually.
- `marketplace.json` → `plugins[].name` must exactly match the plugin folder name AND `plugin.json` → `name`.
- When adding a new plugin, register it in both `.claude-plugin/marketplace.json` AND create `plugins/<name>/.claude-plugin/plugin.json`.
</important>

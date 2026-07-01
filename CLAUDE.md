# atman-marketplace
Claude Code plugin marketplace — mostly plain Markdown and JSON, with a lightweight Node-based validation script for local checks. Content is installed into Claude Code via the `/plugin` command.

## Commands

- check: `npm run check`
- check:mjs: `npm run check:mjs`

## Layout

```
.claude-plugin/marketplace.json        # Marketplace manifest — lists every plugin
plugins/<name>/.claude-plugin/plugin.json  # Plugin manifest (name, version, description)
plugins/<name>/commands/*.md           # Slash commands (LEGACY — do not add new ones; see "Commands vs Skills Policy")
plugins/<name>/agents/*.md             # Sub-agent definitions
plugins/<name>/hooks/hooks.json        # Shell hooks (Windows native by default)
plugins/<name>/.mcp.json               # MCP server configuration
plugins/<name>/skills/<skill>/SKILL.md # Agent skill entry point
```

## Commands vs Skills Policy

New slash commands (`plugins/<name>/commands/*.md`) are **not created** in this
marketplace anymore. A skill with `disable-model-invocation: true` reproduces
command behavior exactly — the `description` is never injected into context
and the body only loads when the user explicitly types the skill name — while
also allowing bundled reference files in the skill folder. For any new
user-invocable, explicit-only functionality, author a skill instead; see
`.claude/rules/skill-authoring.md`.

Existing files under `plugins/*/commands/` are legacy. They keep working and
may be edited in place, but are not a template for new work — see
`.claude/rules/command-authoring.md`. Migrating them to skills is tracked as
separate follow-up work.

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

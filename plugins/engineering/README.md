# engineering

Engineering utilities and helpers for software development tasks.

## Components

### Skills

- `commit-changes`, `create-feature-branch`, `create-pull-request`, `prepare-release`

### Sub-agents

Role-based sub-agents (see `agents/`) so each kind of work runs in its own
context on a model matched to its cost and difficulty. Models are fixed in each
agent's frontmatter:

| Agent | Model | Role |
|-------|-------|------|
| `code-explore` | sonnet | Broad, read-only code investigation / reference tracing |
| `implementer` | sonnet | Implement settled, mostly-mechanical changes |
| `heavy-implementer` | opus | Large / multi-file implementation or debugging |
| `test-runner` | haiku | Run tests/build/lint and summarize the result |

The main session decides when to delegate. To make those criteria available to
Claude automatically, enable delegation-criteria injection (below).

### Commands

- `/install-recommended-skills` — install the mattpocock/skills engineering set.
- `/setup-openspec` — install the OpenSpec CLI and run `openspec init --tools claude`.
- `/setup-project-context` — scaffold or show `.claude/project-context.json` (see below).

### MCP servers

The plugin ships an `.mcp.json` that registers two MCP servers:

| Server | Role |
|--------|------|
| `serena` | Semantic code retrieval / editing toolkit ([oraios/serena](https://github.com/oraios/serena)), run via `uvx`. |
| `context7` | Up-to-date library/framework documentation lookup ([@upstash/context7-mcp](https://github.com/upstash/context7)). |

Each server is started through a small Node launcher under
[`mcp/`](mcp/) that is referenced via `${CLAUDE_PLUGIN_ROOT}`:

```json
{
  "mcpServers": {
    "serena":   { "command": "node", "args": ["${CLAUDE_PLUGIN_ROOT}/mcp/serena-mcp-launcher.mjs"] },
    "context7": { "command": "node", "args": ["${CLAUDE_PLUGIN_ROOT}/mcp/context7-mcp-launcher.mjs"] }
  }
}
```

#### Why launcher scripts?

The two environments need different invocations (Windows calls `uvx` directly;
WSL/Linux runs it inside a login shell so PATH/uv resolve), and a static
`.mcp.json` can't branch on platform. Each launcher does that branch at runtime
via `process.platform`, so **one `.mcp.json` works on both Windows and WSL**.

#### Requirements

- **Node.js** on `PATH` (already required by the other components).
- **serena**: [`uv`/`uvx`](https://docs.astral.sh/uv/) on `PATH`. On WSL it must
  resolve in a login shell (`bash -l`). First launch pulls Serena from git and
  may take a while.
- **context7**: nothing extra — it falls back to `npx -y @upstash/context7-mcp`
  (slower first run). Install globally to speed startup:
  `npm i -g @upstash/context7-mcp`. No API key is required.

After installing/reloading the plugin, confirm both servers connect with `/mcp`.

### SessionStart hook: project context injection

On every session start, the plugin injects a `<project-context>` XML block into
Claude's context containing your registered project paths and the openspec docs
folder. This mirrors the kind of "active project context" you may have wired up
manually with a `settings.json` hook, but ships with the plugin and works on both
Windows and WSL.

The hook is `node`-based, so it runs identically on Windows, WSL, and macOS with
no platform-specific wrapper. It reads a per-project config file and is silent
(injects nothing) when that file is absent — it never nags an unconfigured
project.

#### Configuration

Create `.claude/project-context.json` in the project root (run
`/setup-project-context` to scaffold it, or copy
[`hooks/project-context.example.json`](hooks/project-context.example.json)):

```json
{
  "openspecPath": "C:/repos/atman-marketplace/openspec",
  "projects": [
    {
      "name": "atman-marketplace",
      "path": "C:/repos/atman-marketplace",
      "summary": "Claude Code plugin marketplace"
    },
    { "name": "agent-harness", "path": "C:/repos/agent-harness" }
  ]
}
```

- `roleBasedDelegation`, `openspecPath`, and `projects` are all optional. Omit
  any and the hook skips that part; a missing file injects nothing.
- `name` defaults to `path` when omitted; `summary` is optional.
- `roleBasedDelegation: true` injects the role-based delegation criteria (see
  below).

This produces:

```xml
<project-context>
  <openspec path="C:/repos/atman-marketplace/openspec" />
  <registered-projects>
    <project name="atman-marketplace" path="C:/repos/atman-marketplace">
      <summary>Claude Code plugin marketplace</summary>
    </project>
    <project name="agent-harness" path="C:/repos/agent-harness" />
  </registered-projects>
</project-context>
```

#### Role-based delegation criteria injection

Setting `"roleBasedDelegation": true` in `.claude/project-context.json` makes the
same SessionStart hook also inject a `<role-based-delegation>` block describing
**when to delegate and which sub-agent to use** (the `code-explore`,
`implementer`, `heavy-implementer`, and `test-runner` agents above). This is the
plugin-friendly equivalent of importing a delegation-criteria doc into your
`CLAUDE.md`: the criteria are loaded at session start without you having to edit
`CLAUDE.md`.

The criteria text lives in [`hooks/role-based-model-selection.md`](hooks/role-based-model-selection.md)
and is injected verbatim. The flag is opt-in, so sessions stay lean unless you
ask for it — consistent with the hook's "never nag an unconfigured project"
behavior. Enable it where you actually run multi-step development work (e.g. at
`user` scope, or per repo).

#### How install scope relates to the config

Plugin files (including the hook script) live in the Claude Code plugin cache and
are referenced via `${CLAUDE_PLUGIN_ROOT}` — they are **not** copied into your
project, so there is nothing to commit from the plugin itself. The only
project-local file is `.claude/project-context.json`, which you create per
project. Install the plugin at whichever scope suits you (`user` to have the hook
available everywhere, `project` to share it with a repo's collaborators).

#### Windows / WSL note

Paths in `project-context.json` are injected verbatim. Windows and WSL use
different absolute-path forms (`C:/repos/...` vs `/mnt/c/repos/...`). If you run
Claude Code in both environments against the same repository, set the values to
match the environment you launch from (or keep separate configs).

#### Requirements

- Node.js on `PATH` (already required by `/setup-openspec`).

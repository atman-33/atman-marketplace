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
- `/set-openspec-path` — switch `openspecPath` by picking a registered project from a menu (see below).

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

Whenever it does inject context, the exact injected block is also shown to you as
a `systemMessage` in the transcript, so you can confirm the intended context was
injected. (A missing config still shows nothing.)

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
- `openspecPath` falls back to `<project-root>/openspec` when it is empty **or**
  points at a folder that does not exist, so switching projects rarely needs a
  manual path edit. If neither path exists, the `<openspec>` line is omitted.
  Use `/set-openspec-path` to switch it by picking a registered project from a
  menu instead of hand-editing the absolute path.
- `name` defaults to `path` when omitted; `summary` is optional.
- A sibling repo's own guidance (`CLAUDE.md`/`AGENTS.md` and `.claude/rules`) is
  injected lazily by the PreToolUse hook when you actually touch that repo's
  files — see [PreToolUse hook](#pretooluse-hook-target-repo-guidance-injection)
  below.
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

### PreToolUse hook: target-repo guidance injection

Claude Code only loads memory/rules from the current working directory hierarchy
(upward) plus cwd subdirectories. When you launch the harness in one repo and use
it to develop a **sibling** repo, that sibling's `CLAUDE.md`/`AGENTS.md` and
`.claude/rules/*.md` are never loaded — they live outside the cwd tree. A second
`node`-based hook
([`hooks/scripts/inject-target-rules.mjs`](hooks/scripts/inject-target-rules.mjs))
closes that gap by reproducing the native memory/rule loading for sibling repos.

On every `Read`, `Edit`, or `Write`, the hook resolves the touched file against
the registered projects in `.claude/project-context.json`. When the file lives
under a sibling project root (never the cwd itself — that guidance loads
natively), it injects two things via `additionalContext`:

1. **`<target-project-instructions>`** — the repo's root instruction file
   (`CLAUDE.md` preferred, else `AGENTS.md`), **full text**, injected at most once
   per session per repo. This replaces the old `instructions` path attribute on
   `<project-context>`: instead of just pointing Claude at the file, the content is
   loaded automatically the moment you touch the repo.
2. **`<target-project-rules>`** — the repo's `.claude/rules/*.md` whose `paths:`
   front matter glob-matches the touched file (rules without `paths` always
   apply). Each rule is injected at most once per session, so a path-scoped rule
   still injects the first time a matching file is touched, without re-injecting on
   every subsequent call.

De-duplication uses a temp-dir sentinel keyed by session and file. Whenever it
injects, the hook also surfaces a one-line `systemMessage` summary in the
transcript (e.g. `🔎 target-rules: srms — CLAUDE.md (full) + rules:
backend_repository.md`) so you can see at a glance which instruction file and
rules were injected. The full text only goes to Claude's context, not the
transcript. The hook is failure-tolerant and silent (injects nothing) for
cwd-local files, unregistered paths, or repos without the relevant files.

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

# engineering

Engineering utilities and helpers for software development tasks.

## Components

### Skills

- `commit-changes`, `create-feature-branch`, `create-pull-request`, `prepare-release`

### Commands

- `/install-recommended-skills` — install the mattpocock/skills engineering set.
- `/setup-openspec` — install the OpenSpec CLI and run `openspec init --tools claude`.
- `/setup-project-context` — scaffold or show `.claude/project-context.json` (see below).

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

- `openspecPath` and `projects` are both optional. Omit either and the hook skips
  that section; a missing file injects nothing.
- `name` defaults to `path` when omitted; `summary` is optional.

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

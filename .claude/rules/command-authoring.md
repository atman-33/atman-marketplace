---
paths:
  - "plugins/*/commands/**"
---
# Command Authoring Rules (Legacy — do not create new commands)

New command files are not created in this marketplace. If you are about to
create a new file under `plugins/*/commands/`, stop — author a skill instead
with `disable-model-invocation: true` (see `.claude/rules/skill-authoring.md`).
This file only documents how to maintain the commands that already exist.

Command files in `commands/` become slash commands (filename → `/command-name`). Required frontmatter:

```yaml
---
name: command-name          # maps to /command-name
description: …              # shown in UI
disable-model-invocation: true  # set for procedural commands that need no model reasoning
allowed-tools: Bash(…)      # restrict to only the tools needed
---
```

- Use `$ARGUMENTS` for the full argument string, `$1`/`$2`/… for positional args.
- Always include an `## Output Format` section so output shape is deterministic.
- `disable-model-invocation: true` is appropriate when all steps are shell commands with no reasoning required.

---
paths:
  - "plugins/*/commands/**"
---
# Command Authoring Rules

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

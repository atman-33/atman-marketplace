---
name: install-recommended-skills
description: Install recommended productivity skills (grill-me, handoff, writing-great-skills) via gh skill install.
disable-model-invocation: true
allowed-tools: Bash(gh skill install *) Bash(gh auth status)
---

Install the following recommended productivity skills for Claude Code:

- grill-me
- handoff
- writing-great-skills

Steps:

1. Verify `gh` is installed and authenticated. If `gh auth status` fails, stop and ask the user to run `gh auth login`.
2. Run the following commands in order and report the result of each:

```bash
gh skill install mattpocock/skills productivity/grill-me --agent claude-code
gh skill install mattpocock/skills productivity/handoff --agent claude-code
gh skill install mattpocock/skills productivity/writing-great-skills --agent claude-code
```

3. If any install fails, print the full error, continue with the remaining skills, and report a summary at the end.
4. On success, list the installed skill paths.

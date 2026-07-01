---
paths:
  - "plugins/*/skills/**"
---
# Skill Authoring Rules

Skills live in `plugins/<plugin>/skills/<skill-name>/SKILL.md`. Key frontmatter:

| Key | Purpose |
|-----|---------|
| `name` | Skill identifier (kebab-case) |
| `description` | Used by the model to auto-invoke; omit for user-only skills |
| `disable-model-invocation: true` | Prevents model from auto-firing; user must type the skill name |
| `argument-hint` | Prompt shown when invoked without arguments |
| `allowed-tools` | Restricts which tools the skill may use |
| `compatibility` | Documents hard runtime requirements (e.g. requires `gh`, Python, PowerShell) |

Information hierarchy: inline steps for actions the agent always needs; sibling `.md` files (`GLOSSARY.md`, `REFERENCE.md`, `references/`) for content the agent reaches only sometimes — link them from SKILL.md with `[text](file.md)`.

See `.claude/skills/writing-great-skills/SKILL.md` for the full authoring reference.

## Skills replace commands

This marketplace has no `commands/*.md` files — every former command was
migrated to a skill, and none should be recreated. `disable-model-invocation:
true` makes a skill behave exactly like a slash command: the `description` is
never injected into context on other turns, and the body only loads when
the user explicitly types the skill name. Use this setting for any new
functionality that should be explicit-invocation-only; leave `description`
in place (without the flag) for functionality Claude should be able to
auto-invoke.

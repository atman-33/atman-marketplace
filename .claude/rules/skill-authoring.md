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

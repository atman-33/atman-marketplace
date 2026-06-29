---
name: setup-all
description: Run all engineering plugin setup steps in sequence — install recommended skills, set up OpenSpec, scaffold project-context.json, and set up rules-ex infrastructure.
disable-model-invocation: true
allowed-tools: Bash(gh skill install *) Bash(gh auth status) Bash(node --version) Bash(npm list *) Bash(npm install *) Bash(openspec *) Read Write
---

Run all engineering plugin setup steps in sequence. Each phase is independent — a failure in one phase is reported and the next phase continues.

---

## Phase 1 — Install recommended skills

1. Run `gh auth status`. If it fails, report the error and skip to Phase 2 with a note that skill installation was skipped.
2. Install the following skills in order. On failure, print the full error, continue, and record the failure:

```bash
gh skill install mattpocock/skills engineering/improve-codebase-architecture --agent claude-code
gh skill install mattpocock/skills engineering/tdd --agent claude-code
gh skill install mattpocock/skills engineering/to-issues --agent claude-code
gh skill install mattpocock/skills engineering/to-prd --agent claude-code
gh skill install mattpocock/skills engineering/codebase-design --agent claude-code
gh skill install mattpocock/skills engineering/grill-with-docs --agent claude-code
```

---

## Phase 2 — Set up OpenSpec

3. Run `node --version`. If Node.js is missing or older than 20.19.0, report the version and skip to Phase 3 with a note.
4. Check whether OpenSpec CLI is already installed globally:
   ```bash
   npm list -g @fission-ai/openspec --depth=0
   ```
   If not installed, install it:
   ```bash
   npm install -g @fission-ai/openspec@latest
   ```
5. Run:
   ```bash
   openspec init --tools claude
   ```

---

## Phase 3 — Scaffold project-context.json

6. Read `.claude/project-context.json` in the current project root.
   - If it already exists: show its current contents and note that it was left unchanged.
   - If it does not exist: create it with the following template (placeholder paths must be replaced by the user):
     ```json
     {
       "roleBasedDelegation": true,
       "openspecPath": "<absolute path to the openspec docs folder>",
       "projects": [
         {
           "name": "example-project",
           "path": "<absolute path to a frequently-used project>",
           "summary": "short one-line description (optional)"
         }
       ]
     }
     ```

---

## Phase 4 — Scaffold rules-ex infrastructure

7. Read `.claude/rules/rules-ex-authoring.md`.
   - If it already exists: show its path and note it was left unchanged.
   - If it does not exist: create it with the following content exactly (including the front matter):

````markdown
---
paths:
  - ".claude/rules-ex/**"
---

# Authoring `.claude/rules-ex/*.md` (extended rules)

You are editing a file under `.claude/rules-ex/`. These are **extended rules** — a
custom mechanism, **not** a native Claude Code feature. They only take effect via
the `engineering@atman-marketplace` plugin's `inject-extended-rules` hook (Claude
Code) and the OpenCode mirror `.opencode/plugins/inject-extended-rules-plugin.ts`.
Contrast with `.claude/rules` (native, governs this repo's own files).

Follow this format when creating or editing a rule here:

- **`paths:` is REQUIRED.** A rule with no `paths:` front matter is skipped (a
  cross-cutting rule must declare its scope, or it would fire on every file). The
  folder's `README.md` has no `paths:` precisely so it is ignored.
- **Globs are workspace-relative (cwd = this project's root).** Use `..` to reach
  sibling repos, e.g. `../other-repo/plugins/**/*.mjs`. A bare `src/**` would
  target this repo itself.
- **Matching is strict and root-anchored** — full match from the workspace root, no
  implicit leading `**/` prefix. Use `**` for any depth: `../repo/**/*.ts`. `*`
  matches a single path segment; `?` a single character.
- **Body = the injected rule.** Everything below the front matter is what gets
  injected into context (wrapped in `<extended-rules>`), once per rule per agent
  context per session. Keep it focused and imperative.

```markdown
---
paths:
  - ../other-repo/plugins/**/*.mjs
---
In other-repo .mjs hook scripts: zero dependencies, Node built-ins only.
```
````

8. Read `.claude/rules-ex/README.md`.
   - If it already exists: show its path and note it was left unchanged.
   - If it does not exist: create it with the following content exactly (no front matter — the hook intentionally ignores `README.md`):

```markdown
# `.claude/rules-ex` — workspace extended rules

> **Not a native Claude Code feature.** Unlike `.claude/rules` (which Claude Code
> loads natively), `rules-ex` is a **custom extension**. It only works because of
> the `engineering@atman-marketplace` plugin's `inject-extended-rules` hook (Claude
> Code) and its OpenCode mirror `.opencode/plugins/inject-extended-rules-plugin.ts`.
> Without that plugin enabled (or the OpenCode plugin present), files in this folder
> are ignored — nothing is injected.

Cross-cutting rules kept in the workspace and injected when you edit files in
**other** repos, via cwd-relative globs. This is the *extended* form of
`.claude/rules` (which only governs this repo's own files).

Two complementary injection paths:

| Folder | Native? | Loaded by | Scope |
|--------|---------|-----------|-------|
| `.claude/rules` | **Yes** (Claude Code built-in) | Claude Code itself (+ engineering hook for sibling repos) | files of the repo it lives in, via repo-relative `paths:` |
| `.claude/rules-ex` | **No** (custom) | `inject-extended-rules` hook / OpenCode mirror | files in ANY repo, via cwd-relative `..` globs |

## Rule file format

Each `*.md` here needs `paths:` front matter (REQUIRED — a rule with no `paths:`
is skipped). Globs are resolved relative to the workspace root, so use `..` to
reach sibling repos. Matching is strict and root-anchored.

```markdown
---
paths:
  - ../other-repo/plugins/**/*.mjs
---
Rule text injected into context when a matching file is touched.
```

`README.md` itself has no `paths:`, so it is ignored by the hook.

> Tip: when you Read/Edit a file in this folder, an authoring guide is auto-injected
> from `.claude/rules/rules-ex-authoring.md` (a native path-scoped rule).
```

---

## Output Format

After all four phases complete, print a summary table:

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Recommended skills | ✓ / ✗ | list any failed skills |
| 2 — OpenSpec | ✓ / ✗ | skipped / installed / already installed |
| 3 — project-context.json | ✓ / ✗ | created / already existed |
| 4 — rules-ex infrastructure | ✓ / ✗ | created / already existed (per file) |

Then remind the user:
- Edit the placeholder paths in `.claude/project-context.json` before starting a new session.
- Changes to `project-context.json` take effect on the next session start (not `/reload-plugins`).
- Use absolute paths matching your environment (Windows: `C:/repos/...`, WSL: `/mnt/c/repos/...`).
- Add cross-cutting rules as `*.md` files under `.claude/rules-ex/` — each must have a `paths:` front matter.

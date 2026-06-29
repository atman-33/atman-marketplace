---
name: setup-rules-ex
description: Scaffold the rules-ex extended-rules infrastructure (.claude/rules/rules-ex-authoring.md and .claude/rules-ex/README.md) required by the engineering plugin's inject-extended-rules hook.
disable-model-invocation: true
allowed-tools: Read Write
---

Scaffold the two files that enable the `rules-ex` extended-rules system for this
project. Both files are templates — they will not be overwritten if they already
exist.

**What gets created:**

- `.claude/rules/rules-ex-authoring.md` — a native path-scoped rule that
  auto-injects an authoring guide whenever you Read/Edit a file under
  `.claude/rules-ex/`. Required so the guide fires for the *current* repo
  (native `.claude/rules` files only govern the repo they live in).
- `.claude/rules-ex/README.md` — explains what the `rules-ex` folder is and how
  to author rules in it. Has no `paths:` front matter intentionally, so the hook
  ignores it.

---

## Steps

1. Read `.claude/rules/rules-ex-authoring.md`.
   - If it already exists, display its path and current contents, then note it
     was left unchanged.
   - If it does not exist, create it with the following content exactly (including
     the front matter):

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

2. Read `.claude/rules-ex/README.md`.
   - If it already exists, display its path and current contents, then note it
     was left unchanged.
   - If it does not exist, create it with the following content exactly (no front
     matter — the hook intentionally ignores `README.md`):

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

Print a summary table after completing both steps:

| File | Status |
|------|--------|
| `.claude/rules/rules-ex-authoring.md` | created / already existed |
| `.claude/rules-ex/README.md` | created / already existed |

Then remind the user:
- Add your own cross-cutting rules as `*.md` files under `.claude/rules-ex/`.
  Each file must have a `paths:` front matter (workspace-relative globs) — see
  the authoring guide that auto-injects when you edit files there.
- The `inject-extended-rules` hook fires on Read/Edit/Write; rules take effect
  immediately in the current session without a restart.

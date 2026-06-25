---
name: commit-helper
description: Helps draft Conventional Commits messages from staged changes. Use when creating a commit, writing a commit message, or summarizing staged diff.
---

# Commit Helper

Produce a Conventional Commits message based on the currently staged diff.

## Steps

1. Run `git diff --staged` to inspect staged changes.
2. Classify the change type (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert).
3. Summarize the scope (a short noun in parentheses, optional).
4. Write a concise imperative subject line (<= 72 chars), lowercase, no trailing period.
5. If needed, add a body explaining *what* and *why* (wrap at 72 chars).

## Output format

```
<type>(<scope>): <subject>

<body>
```

Do not commit automatically. Only suggest the message and let the user confirm.
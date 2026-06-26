---
name: setup-project-context
description: Scaffold or show the .claude/project-context.json file that the SessionStart hook reads to inject registered project paths and the openspec docs folder into context.
disable-model-invocation: true
allowed-tools: Read Write
---

Set up the per-project configuration consumed by the engineering plugin's
`SessionStart` hook. The hook reads `.claude/project-context.json` from the
project root and injects a `<project-context>` block (registered project absolute
paths + openspec docs folder) into Claude's context at session start.

Steps:

1. Check whether `.claude/project-context.json` already exists in the current
   project (read it).
   - If it exists, show its current contents and stop. Tell the user to edit it
     by hand, and that changes take effect on the next session start.

2. If it does not exist, create `.claude/project-context.json` with this
   template (replace the placeholder paths with the user's real absolute paths):

   ```json
   {
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

3. Report what was done and remind the user:
   - `openspecPath` and `projects` are both optional; omit either and the hook
     skips that part. A missing file injects nothing.
   - Use absolute paths for the current environment. Windows and WSL use
     different path forms (`C:/repos/...` vs `/mnt/c/repos/...`), so if you run
     Claude Code in both on the same repo, the values must match the environment
     you launch from.
   - The new context is injected on the next session start (`/reload-plugins`
     does not re-run SessionStart; start a new session or `/clear`).

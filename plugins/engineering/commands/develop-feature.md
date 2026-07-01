---
name: develop-feature
description: Implement a feature or fix end-to-end from spec to PR — reuse or create a feature branch, implement with TDD, simplify, self-verify, commit, request user verification, then open a PR to main.
disable-model-invocation: true
allowed-tools: Skill Read Write Edit Grep Glob Bash AskUserQuestion
---

# Develop Feature

Implement the feature or fix described below, carrying it through the full
branch → TDD → simplify → verify → commit → user verification → PR lifecycle.

Spec: $ARGUMENTS

If no spec is given as an argument, use the specification already established
in this conversation (the user's most recent instructions, requirements
already discussed, or an agreed-on OpenSpec change). Do not ask the user to
repeat themselves if the spec is already clear from context; ask only if it is
genuinely ambiguous.

## Steps

1. **Feature branch.** Run `git branch --show-current`.
   - If already on a branch other than the repository's default branch (e.g.
     an existing `feature/*` branch), stay on it — do not switch.
   - If on the default branch, invoke the **create-feature-branch** skill to
     create and switch to a new feature branch derived from the spec.

2. **Implement with TDD.** Invoke the **tdd** skill to implement the spec
   test-first (red → green → refactor). Keep implementing and verifying
   (running the test suite, lint/build as applicable) until the feature is
   complete and all checks pass.

3. **Simplify.** Invoke the **simplify** skill to review the diff for reuse,
   simplification, efficiency, and altitude cleanups, and apply the fixes. It
   does not hunt for bugs, so re-run the test suite (and lint/build as
   applicable) afterward to confirm the cleanup did not break anything.

4. **Self-verify.** Invoke the **verify** skill to run the app and confirm the
   change actually behaves as specified, before asking the user to look at it.
   If it fails, fix the issue, re-run the affected steps above, and verify
   again.

5. **Commit.** Once implementation, simplification, and self-verification are
   complete with no outstanding issues, invoke the **commit-changes** skill to
   commit the work with a Conventional Commits message.

6. **Request user verification.** After the commit, tell the user what was
   implemented and ask them to manually verify the behavior (e.g. run the app,
   exercise the feature) before proceeding. Stop and wait for their
   confirmation — do not create the PR yet.

7. **Create the PR.** Once the user confirms the change works, invoke the
   **create-pull-request** skill to open a PR. Unless the user specifies
   another target, the PR is for merging into the `main` branch.

## Notes

- Follow the steps in order; do not skip the self-verify or user-verification
  steps even if all automated tests and checks pass.
- If TDD implementation surfaces a blocker (ambiguous spec, a check that
  cannot be made to pass), stop and report it rather than continuing.
- If self-verify (step 4) or the user (step 6) reports a problem, fix it,
  re-verify, and only then proceed to the next step.

## Output Format

Report progress step by step:
- Step name and outcome (done / blocked / waiting on user).
- The branch name in use.
- Files changed, once implementation is done.
- At step 4, a summary of what self-verify checked and its result.
- At step 6, an explicit request for the user to verify the behavior, then stop.
- At step 7, the resulting PR URL.

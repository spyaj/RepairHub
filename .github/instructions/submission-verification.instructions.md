---
description: "Use for every coding task in this workspace. Enforces running and reporting the submission verification checklist before final handoff."
name: "Submission Verification"
applyTo: "**"
---

# Submission Verification

Before finalizing any implementation task, always run a verification pass against `docs/VERIFICATION_CHECKLIST.md` and report:

- Which checklist items are verified by evidence in the code or commands
- Which items are not yet verified
- What exact next action is required for any incomplete item

## Mandatory Behavior

- Do not claim completion without explicitly checking applicable checklist items.
- If tests or commands are not runnable, state that clearly and mark related checklist items as unverified.
- For partial implementations, clearly scope what was verified versus deferred.

## Final Handoff Format

Include a `Verification` section with:

- `Verified:` bullet list
- `Not verified yet:` bullet list
- `Next required step:` numbered list

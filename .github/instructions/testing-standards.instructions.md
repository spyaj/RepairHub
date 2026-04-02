---
description: "Use when adding or changing features, APIs, server actions, or domain logic. Enforces a minimum role-based test matrix and required failure-path coverage for RepairHub."
name: "Testing Standards"
applyTo: "app/**/*.ts, app/**/*.tsx, lib/**/*.ts, lib/**/*.tsx, components/**/*.ts, components/**/*.tsx, **/*.test.ts, **/*.test.tsx, **/*.spec.ts, **/*.spec.tsx, tests/**/*.ts, tests/**/*.tsx, e2e/**/*.ts"
---

# Testing Standards

- Every feature change must include tests for happy path and at least one meaningful failure path.
- Keep tests close to business risk: auth, role boundaries, payments/escrow, disputes, and recommendation output.
- Do not merge UI/API/DB feature work without validating behavior with automated tests.

## Minimum Role Matrix

For role-aware features, test all applicable roles:

- Client: allowed actions, denied admin-only/repairer-only actions.
- Repairer: allowed actions, denied client-only/admin-only actions.
- Admin: moderation and override paths, denied non-admin endpoints for non-admin users.
- Unauthenticated user: denied for protected routes/actions.

If a feature is role-neutral, explicitly document why role matrix is not required.

## Required Failure Paths

For each feature slice, include failure coverage for relevant cases:

- Validation failure (invalid body/query/params)
- Authorization failure (401/403)
- Not found or ownership mismatch (404/403)
- Conflict or business rule violation (409/422)
- External dependency failure for AI/payment/integration calls

## API And Server Action Testing

- Verify status code, response shape, and error contract for success and failure.
- Verify auth and ownership checks with role-specific scenarios.
- Verify side effects for critical flows (escrow state changes, dispute transitions, rewards updates).

## Database And Migration Validation

- When schema changes are introduced, add tests for new constraints and relations.
- Verify seed assumptions used by tests are deterministic and repeatable.
- Add regression tests for any bug fixed in query, relation, or transaction logic.

## UI Testing Expectations

- Test critical user flows, not only isolated rendering.
- Verify role-based visibility and action availability in dashboards/panels.
- Cover primary form validation and error display behavior.

## Sustainability And Explainability Checks

- For impact metrics, test calculation outputs and unit consistency.
- For recommendation/cost outputs, test presence of explainability fields (inputs, assumptions, confidence/range).

## If Test Framework Is Missing

- Propose and add a minimal framework setup as part of the feature branch before adding feature tests.
- Prefer incremental setup: unit/integration baseline first, then e2e for highest-risk workflows.

## Definition Of Done For Testing

- Happy path and failure path tests are included for modified behavior.
- Role matrix coverage is present or explicitly waived with reason.
- Critical API/server action responses are asserted (status + body shape).
- New bug fixes include regression tests.
- Test commands are runnable in the repository and documented when newly introduced.

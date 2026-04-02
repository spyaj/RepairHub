---
description: "Use when implementing one vertical feature slice end-to-end (database + API + UI + tests) in this RepairHub project."
name: "Build Feature Slice"
argument-hint: "Feature name + user story + acceptance criteria + role(s)"
agent: "agent"
---

Implement one production-style vertical feature slice for RepairHub.

User input:
${input:Describe the feature, roles involved (client/repairer/admin), and acceptance criteria.}

Execution requirements:

- Follow workspace standards in [copilot-instructions](../copilot-instructions.md).
- Follow API standards in [backend-api-standards](../instructions/backend-api-standards.instructions.md).
- Follow DB standards in [database-prisma-rules](../instructions/database-prisma-rules.instructions.md).
- Follow UI standards in [frontend-ui-consistency](../instructions/frontend-ui-consistency.instructions.md).

Deliver this exact workflow:

1. Discover current related code and summarize what already exists.
2. Propose a minimal implementation plan for this single slice.
3. Implement database changes first:
   - Prisma schema updates
   - Migration files
   - Seed updates if needed
4. Implement backend/API changes:
   - Route handlers or server actions
   - Input validation
   - Auth/role checks
   - Consistent error responses and structured logs
5. Implement frontend UI changes:
   - Role-appropriate screens/components
   - Reuse shared styles/components
   - Keep responsive and accessible behavior
6. Implement tests:
   - At minimum: happy path + key failure path
   - Include API and critical business logic coverage
7. Run and report verification commands that exist in the repo.
8. Provide a concise change summary with file list and any follow-up TODOs.

Output format requirements:

- Start with: `Feature implemented:` and one-line scope summary.
- Then include sections in this order:
  - `Plan`
  - `Database Changes`
  - `API Changes`
  - `UI Changes`
  - `Tests`
  - `Validation Results`
  - `Risks / Follow-ups`
- In each section, include concrete file paths and what changed.

Constraints:

- Keep the slice scoped; do not attempt unrelated refactors.
- Never expose secrets in client code.
- Prefer additive database migrations.
- If required dependencies are missing, add only what is necessary and justify briefly.

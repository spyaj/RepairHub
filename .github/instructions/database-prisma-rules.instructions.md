---
description: "Use when creating or editing Prisma schema, migrations, seed scripts, and database-access code in Next.js. Standardizes naming, migration safety, indexing strategy, and seed data workflow."
name: "Database Prisma Rules"
applyTo: "prisma/**/*.prisma, prisma/migrations/**/*.sql, prisma/**/*seed*.ts, prisma/**/*seed*.js, lib/server/db/**/*.ts, app/api/**/*.ts, app/**/actions.ts, app/**/actions/*.ts"
---

# Database Prisma Rules

- Keep data model changes backward-compatible where possible and safe for staged releases.
- Centralize Prisma client access in server modules; do not instantiate Prisma client inside route handlers repeatedly.
- Design schema around the three product roles: client, repairer, and admin.

## Naming Conventions

- Use PascalCase model names and singular nouns (for example `User`, `RepairJob`, `Dispute`).
- Use camelCase field names in Prisma schema.
- Use explicit relation names when a model has multiple relations to the same target.
- Use enums for bounded domain states (job status, dispute status, role, warranty period type).
- Keep DB table/column mapping consistent and explicit only when needed via `@@map` and `@map`.

## Required Model Baseline

- Include `id`, `createdAt`, and `updatedAt` on core entities unless there is a strong reason not to.
- Use timezone-safe timestamps and consistent date semantics.
- Add soft-delete fields only when recovery/auditing is needed and enforce query filters consistently.

## Migration Rules

- Every schema change must be delivered with a migration.
- Prefer additive changes first (new nullable columns, backfill, then tighten constraints in a later migration).
- Avoid destructive operations (drop column/table, irreversible renames) in the same release as feature delivery.
- For risky data transformations, include idempotent SQL/backfill steps and rollback notes.
- Keep migration names descriptive and feature-linked.

## Indexing Strategy

- Add indexes for common filter/sort access patterns used by matching and dashboards.
- Add compound indexes for frequently combined filters (for example category + location + rating visibility).
- Add unique constraints for natural uniqueness boundaries (email, external IDs, one-review-per-job-per-user patterns).
- Re-check index necessity when query patterns change; avoid redundant indexes that hurt writes.

## Referential Integrity

- Define `onDelete` and `onUpdate` behavior explicitly for critical relations.
- Use transactions for multi-step writes that must stay consistent (escrow release, dispute resolution updates, rewards grants).
- Avoid orphan records by modeling required relations where business rules require ownership.

## Seed Data Strategy

- Maintain deterministic seed scripts for demo and testability.
- Seed realistic Canberra-focused data: suburbs, repair categories, repairers, jobs, reviews, impact metrics.
- Keep seed scripts idempotent (safe to run multiple times).
- Separate minimal dev seed from rich demo seed if dataset size differs.

## Performance And Query Shape

- Select only required fields; avoid over-fetching with broad includes.
- Use pagination for list endpoints by default.
- Prefer server-side filtering/sorting in Prisma queries, not in-memory filtering after fetch.

## Definition Of Done For DB Tasks

- Schema changes follow naming conventions and role/domain boundaries.
- Migration is generated, reviewed, and safe for incremental rollout.
- Required indexes/constraints are present for new query paths.
- Seed updates included when new models/fields affect demos or tests.
- API and server code using new schema is updated with validation and tests.

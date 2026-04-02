# Project Guidelines

## Project Scope

- Build a complete final-year IT project: Community Repair Hub for Canberra, Australia.
- Keep the current frontend stack: Next.js (App Router) + Tailwind CSS.
- Deliver a production-style web app with working frontend, backend APIs, database, auth, and role-based dashboards.
- Prioritize sustainability and community outcomes (repair over replacement, reduced waste, CO2 impact visibility).

## Product Requirements

- Support three role panels with clear boundaries:
  - Client panel: request repairs, track jobs, escrow payments, impact stats, rewards.
  - Repairer panel: manage jobs, pricing, warranties, pickup/delivery options, earnings insights.
  - Admin panel: user/repairer verification, disputes, moderation, analytics, system settings.
- Implement core categories: electronics, furniture, clothing, bikes.
- Include AI-assisted features using free or freemium APIs (no model training from scratch):
  - Image-based damage analysis
  - Cost estimation support
  - Repair-vs-replace recommendation assistance
  - Matching support signals (distance, ratings, category expertise)
- Keep data and UX relevant to Canberra context (suburbs, local workshops/events, recycling/donation partners where possible).

## Architecture

- Use Next.js App Router patterns:
  - `app/` for routes and UI composition
  - `app/api/` for server endpoints
  - Shared domain logic in reusable modules (avoid embedding business logic in page components)
- Define explicit domain modules early:
  - Auth and roles
  - Users and profiles
  - Repair jobs and lifecycle
  - Escrow and payments
  - Reviews and trust signals
  - Sustainability metrics
  - Community posts/tutorials/events
- Prefer server-side data access and validation on API boundaries.

## Build And Test

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Prod build: `npm run build`
- Start prod server: `npm run start`
- Add automated tests as features are implemented (unit + integration + key e2e flows).

## Conventions

- Use TypeScript strict mode and keep shared types in central domain files.
- Keep existing visual language and design tokens from `tailwind.config.ts` unless intentionally evolving the brand.
- Prefer composable components over large monolithic page files.
- Use clear service boundaries for AI providers so models/providers can be swapped without UI rewrites.
- For all monetary and recommendation features, return explainable outputs (inputs, assumptions, confidence/range).
- Never expose provider secrets in client code; call AI/payment services from server routes only.

## Delivery Priorities

- Build in vertical slices that are demo-ready:
  1. Auth + role onboarding
  2. Repair request creation with media upload
  3. Repairer matching and booking
  4. Job tracking + escrow simulation
  5. Reviews, warranty, disputes
  6. Sustainability dashboard and rewards
  7. Community tutorials, Q&A, events
- Every slice should include: UI, API route, DB schema updates, validation, and basic tests.

## Documentation

- Keep high-level setup in `README.md`.
- Add focused docs under `docs/` as the project grows and link them from `README.md` instead of duplicating guidance here.

# RepairHub Project Blueprint

## 1) Feasible Feature List (Priority Ordered)

### Foundation (must build first)

- Role-based auth and onboarding (client, repairer, admin)
- User profile and Canberra suburb/location capture
- Multi-category repair requests (electronics, furniture, clothing, bikes)
- Repair request media upload
- Repairer discovery and matching (distance, rating, category skill)
- Job lifecycle tracking (posted -> booked -> in progress -> completed/disputed)

### Trust, Payments, and Business Core

- Verified repairer workflow (ID and certification review)
- Quote and booking flow with repairer offers
- Escrow simulation using Stripe test mode
- Warranty options (7-day, 30-day, custom)
- Dispute management and admin resolution
- Reviews and rating system
- Repair history and repairer earnings analytics

### AI and Decision Support (free/freemium APIs)

- Image-based damage analysis (Gemini or Hugging Face API)
- Repair cost range estimator (rules + historical data)
- Repair-vs-replace recommendation (cost, market value, sustainability)
- Explainable recommendations (inputs, assumptions, confidence)

### Sustainability and Community

- Environmental impact tracker (waste diverted, CO2 saved)
- Green rewards wallet and points events
- Donation partner and recycling center suggestions
- DIY tutorials and community Q&A
- Workshop/events listing and registration

### Optional stretch goals

- Emergency repair surcharge flow
- Pickup and delivery zoning with max distance
- Fraud/risk flags on disputes and repeated complaints
- Admin moderation queue automation

## 2) Recommended Tech Stack

### Keep (already chosen)

- Next.js App Router + TypeScript strict mode
- Tailwind CSS

### Backend and data

- Prisma ORM + PostgreSQL
- Supabase Postgres (free tier) for hosted DB
- Next.js route handlers/server actions for APIs

### Auth and storage

- NextAuth (credentials strategy for initial slice, OAuth can be added later)
- Google OAuth can be enabled alongside credentials when keys are provided
- Cloudinary (free tier) for media storage

### AI, maps, payments

- Gemini API free tier for image analysis and recommendation support
- Optional Hugging Face API fallback
- OpenStreetMap/Nominatim as primary map/geocoding option (free)
- Optional OpenCage key fallback for geocoding rate-limit resilience
- Stripe test mode for escrow simulation

### Notifications and observability

- Resend for email notifications
- Sentry free tier for error monitoring

### Testing

- Vitest + Testing Library for unit/integration
- Playwright for critical e2e flows

## 3) Complete File Structure (Target)

```text
repairhub/
  .github/
    copilot-instructions.md
    agents/
      repairhub-architect.agent.md
    prompts/
      build-feature-slice.prompt.md
    instructions/
      frontend-ui-consistency.instructions.md
      backend-api-standards.instructions.md
      database-prisma-rules.instructions.md
      testing-standards.instructions.md
      submission-verification.instructions.md

  app/
    (public)/
      page.tsx
      about/page.tsx
      repairers/page.tsx
      tutorials/page.tsx
      events/page.tsx
    (auth)/
      sign-in/page.tsx
      sign-up/page.tsx
      onboarding/page.tsx
    (client)/
      dashboard/page.tsx
      repairs/page.tsx
      repairs/new/page.tsx
      repairs/[repairJobId]/page.tsx
      rewards/page.tsx
      impact/page.tsx
    (repairer)/
      dashboard/page.tsx
      jobs/page.tsx
      jobs/[repairJobId]/page.tsx
      earnings/page.tsx
      verification/page.tsx
    (admin)/
      dashboard/page.tsx
      verification/page.tsx
      disputes/page.tsx
      moderation/page.tsx
      analytics/page.tsx
    api/
      auth/[...nextauth]/route.ts
      repairs/route.ts
      repairs/[repairJobId]/route.ts
      repairs/[repairJobId]/quotes/route.ts
      matching/route.ts
      ai/damage-analysis/route.ts
      ai/cost-estimate/route.ts
      ai/repair-vs-replace/route.ts
      escrow/create/route.ts
      escrow/release/route.ts
      disputes/route.ts
      disputes/[disputeId]/route.ts
      sustainability/impact/route.ts
      community/posts/route.ts
      community/events/route.ts

  components/
    ui/
      button.tsx
      card.tsx
      badge.tsx
      input.tsx
      modal.tsx
    shared/
      header.tsx
      footer.tsx
      role-guard.tsx
    repair/
      repair-request-form.tsx
      quote-list.tsx
      status-timeline.tsx
      impact-summary.tsx
    admin/
      dispute-table.tsx
      verification-queue.tsx

  lib/
    server/
      auth/
        session.ts
        roles.ts
      db/
        client.ts
        repositories/
      services/
        ai/
          gemini.ts
          huggingface.ts
          prompts.ts
        payments/
          stripe.ts
        maps/
          geocoding.ts
          distance.ts
        matching/
          ranking.ts
        sustainability/
          calculator.ts
      validation/
        repairs.ts
        quotes.ts
        disputes.ts
        users.ts
      observability/
        logger.ts
        request-id.ts
    shared/
      types/
      constants/
      utils/

  prisma/
    schema.prisma
    migrations/
    seed.ts

  tests/
    integration/
    api/
    role-matrix/
  e2e/
    auth.spec.ts
    repairs-flow.spec.ts
    escrow-dispute.spec.ts

  docs/
    PROJECT_BLUEPRINT.md
    VERIFICATION_CHECKLIST.md

  .env.example
  .env.local
  package.json
  README.md
```

## 4) Delivery Sequence (12-week feasible plan)

- Week 1-2: Auth, roles, profile, base schema
- Week 3-4: Repair request creation, image upload, basic matching
- Week 5-6: Quotes, booking, status timeline, repairer dashboard
- Week 7: Escrow simulation + warranty options
- Week 8: Reviews + disputes + admin moderation
- Week 9: AI analysis, cost estimate, repair-vs-replace recommendation
- Week 10: Sustainability tracker + green rewards
- Week 11: Community tutorials/Q&A/events
- Week 12: Hardening, tests, final demo polish, submission artifacts

## 5) Admin Access Policy

- Admin accounts are created manually through `prisma/seed.ts` using `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`.
- Admin sign-up is not exposed in the public onboarding flow.

# RepairHub (Canberra Community Repair Platform)

RepairHub is a final-year IT project built with Next.js and Tailwind to connect local people with repair experts, reduce waste, and track sustainability outcomes.

Current implementation decisions:

- Auth: NextAuth
- Google OAuth: optional, enabled when GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are set
- Storage: Cloudinary
- Maps: OpenStreetMap/Nominatim (free-first)
- Payments: Stripe test mode
- AI: Gemini primary, Hugging Face fallback

Admin access is seeded manually from environment variables in `prisma/seed.ts` using `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

- Copy values from `.env.example` into `.env.local`
- Add your real API keys and credentials

3. Run development server:

```bash
npm run dev
```

4. Build and lint checks:

```bash
npm run lint
npm run build
```

## Project Docs

- Blueprint and full target structure: `docs/PROJECT_BLUEPRINT.md`
- Submission verification checklist: `docs/VERIFICATION_CHECKLIST.md`
- Prisma schema draft: `prisma/schema.prisma`

## Agent Customization Files

- Workspace instructions: `.github/copilot-instructions.md`
- Frontend standards: `.github/instructions/frontend-ui-consistency.instructions.md`
- Backend API standards: `.github/instructions/backend-api-standards.instructions.md`
- Prisma/database standards: `.github/instructions/database-prisma-rules.instructions.md`
- Testing standards: `.github/instructions/testing-standards.instructions.md`
- Always-run verification: `.github/instructions/submission-verification.instructions.md`
- Reusable feature-slice prompt: `.github/prompts/build-feature-slice.prompt.md`
- Planning agent: `.github/agents/repairhub-architect.agent.md`

## Environment Safety

- `.env.local` is ignored by git.
- `.env.example` contains placeholders and key source links only.
- Never commit real secrets.

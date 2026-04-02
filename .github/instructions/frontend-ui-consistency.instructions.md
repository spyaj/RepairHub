---
description: "Use when building or editing frontend UI in Next.js App Router pages/components, including Tailwind classes and CSS. Enforces shared layout/components and design token consistency."
name: "Frontend UI Consistency"
applyTo: "app/**/*.{ts,tsx,css}, components/**/*.{ts,tsx,css}, tailwind.config.ts"
---

# Frontend UI Consistency

- Keep the current visual system and avoid introducing a second style language.
- Reuse existing UI primitives and class patterns from `app/globals.css` before creating new variants.
- Prefer composition: extract repeated UI into small reusable components instead of adding large monolithic page markup.

## Design Tokens First

- Use color, spacing, radius, and shadow tokens defined in `tailwind.config.ts`.
- Prefer semantic classes/tokens (for example green, amber, cream, ink variants) over raw hex values in JSX.
- When raw CSS is necessary, prefer existing CSS variables from `:root` in `app/globals.css`.
- Keep typography consistent with `--font-display` and `--font-body`.

## Tailwind + CSS Usage Rules

- Use Tailwind for layout, spacing, and responsive behavior first.
- Use `app/globals.css` for shared component classes and design-system-like primitives (`.btn`, `.card`, `.badge`, grid helpers).
- Do not duplicate nearly identical class blocks; extend existing classes or create a new shared utility once.
- Preserve mobile behavior when editing desktop UI; every UI change should remain usable at small breakpoints.

## Page And Component Structure

- For App Router pages, keep business logic out of render-heavy page files.
- Move reusable UI blocks into `components/` as features grow.
- Keep navigation and dashboard sections role-oriented (client, repairer, admin) with clear boundaries.

## Accessibility And UX Baseline

- Use semantic elements (`button`, `nav`, `main`, headings) and maintain heading hierarchy.
- Ensure adequate contrast for text and controls using the existing palette.
- Provide visible hover/focus states for interactive elements.

## Definition Of Done For UI Tasks

- Visual style matches existing RepairHub branding and token palette.
- No unnecessary one-off hardcoded values when an existing token/class can be reused.
- Responsive behavior validated for mobile and desktop.
- Repeated patterns extracted into reusable components or shared classes.

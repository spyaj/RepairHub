# Verification Checklist (Before Submission)

Use this checklist before every feature PR and final submission.

## Product completeness

- [ ] Client, repairer, and admin panels are implemented and role-protected.
- [ ] Core categories supported: electronics, furniture, clothing, bikes.
- [ ] End-to-end repair lifecycle works: request -> quote -> booking -> completion/dispute.

## AI feature readiness

- [ ] Damage analysis endpoint returns explainable output and confidence.
- [ ] Cost estimator returns a range with assumptions.
- [ ] Repair-vs-replace recommendation includes rationale and confidence/range.
- [ ] AI errors and provider limits are handled gracefully.

## Trust and business flows

- [ ] Repairer verification flow works (pending/verified/rejected).
- [ ] Warranty options are attached and test-covered.
- [ ] Escrow simulation (test mode) works with release/refund paths.
- [ ] Dispute flow supports create, review, and admin resolution.

## Sustainability and community

- [ ] Waste diverted and CO2 saved are computed and displayed.
- [ ] Rewards points update from repair completion and are traceable.
- [ ] Donation/recycling suggestions are shown based on category/location.
- [ ] Tutorials/Q&A/events pages and data flows are functional.

## Security and reliability

- [ ] Secrets are server-side only and not exposed to client bundles.
- [ ] Validation is present on all API boundaries.
- [ ] Role and ownership checks are enforced on protected actions.
- [ ] Consistent error contract and requestId logging are implemented.

## Testing minimums

- [ ] Happy path and failure path tests exist for modified features.
- [ ] Role matrix coverage exists (client/repairer/admin/unauthenticated) where applicable.
- [ ] API and server action tests assert status + response shape.
- [ ] Critical e2e flows pass: auth, repair booking, escrow/dispute.

## Deployment and demo

- [ ] Production build passes (`npm run build`).
- [ ] Lint passes (`npm run lint`).
- [ ] App runs in production mode (`npm run start`).
- [ ] Seeded demo data is realistic and deterministic.
- [ ] README and docs are updated with run/setup/testing steps.

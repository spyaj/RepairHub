---
description: "Use when creating or editing backend API handlers, route handlers, and server actions in Next.js. Enforces request validation, consistent error format, authorization checks, and structured logging."
name: "Backend API Standards"
applyTo: "app/api/**/*.ts, app/api/**/*.tsx, app/**/actions.ts, app/**/actions/*.ts, lib/server/**/*.ts"
---

# Backend API Standards

- Keep business logic out of page components and client components.
- Implement backend logic in route handlers, server actions, and reusable server modules.
- Never expose secrets or provider keys in client-side code.

## Validation

- Validate all external input at API boundaries before processing.
- Reject malformed input with deterministic 4xx responses and clear field-level error details.
- Validate path params, query params, headers, and body, not only request body.
- Use schema-based validation in shared modules so rules are reusable across endpoints.

## Error Response Contract

- Return JSON errors with one consistent shape across all endpoints.
- Use this structure for non-2xx responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [],
    "requestId": "req_xxx"
  }
}
```

- Keep messages safe for clients and do not leak stack traces or internal provider details.
- Map errors to correct status codes:
  - 400 bad request
  - 401 unauthenticated
  - 403 unauthorized
  - 404 not found
  - 409 conflict
  - 422 semantic validation failure
  - 429 rate limited
  - 500 internal server error

## Auth And Authorization

- Require authentication for non-public endpoints by default.
- Enforce role checks for client, repairer, and admin actions.
- Perform ownership checks on resource mutations.
- Never trust role or user identifiers from client input when server session data exists.

## Logging And Observability

- Use structured logs with stable keys for requestId, route, actorId, role, statusCode, and latencyMs.
- Log key lifecycle points: request start, validation failure, auth failure, external provider call, success, and handled error.
- Redact sensitive data from logs, including secrets, tokens, and personal information not required for debugging.
- Include a requestId in responses and logs to support traceability.

## AI, Money, And Recommendation Endpoints

- Keep AI and payment calls server-side only.
- Return explainable recommendation output with inputs, assumptions, and confidence or range.
- For pricing or escrow-related responses, include explicit currency and calculation basis.

## Definition Of Done For API Tasks

- Input validation implemented for all request surfaces.
- Auth and role checks enforced for protected operations.
- Error responses follow the shared JSON error contract.
- Structured logging added with sensitive data redaction.
- Endpoint behavior covered by at least basic happy-path and failure-path tests.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Remy customer frontend instructions

## Stack and boundaries

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4.
- The application is a static export (`output: "export"`) deployed to S3/CloudFront. Do not introduce server-only Next.js features.
- Preserve the mobile-first 402px shell and existing design tokens unless the task explicitly changes the design.
- Existing user changes under `infra/` must not be overwritten.

## Commands

```powershell
npm ci
npm run dev
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

There is no automated test suite yet. Do not describe lint, typecheck, build, browser flow, or payment flow as verified unless it was run.

## API and authentication

- Use `src/lib/api/client.ts` and a domain module under `src/lib/api/`; do not scatter raw fetch contracts across pages.
- The backend response envelope is unwrapped by the shared client. Keep DTO types, API functions, callers, and loading/error states synchronized when contracts change.
- Protected requests include the established credentials/auth behavior; public endpoints must opt out explicitly.
- Revisit the current localStorage Bearer plus cookie strategy through an ADR before changing token storage, refresh, CORS, or CSRF behavior.
- `NEXT_PUBLIC_*` values are browser-visible. Never place Payple cst id, cust key, refund key, webhook token, DB/JWT/AWS secrets, callback auth keys, or card data there.

## Payment invariants

- The target flow is reservation with `ticketOptionId` -> `/payments/prepare` -> Payple authentication -> `/payments/approve` -> status polling/result page.
- Use the server-returned order id and amount as the source of truth. Do not submit or display a client-calculated amount as authoritative.
- Do not treat `APPROVING`, `IN_DOUBT`, `RECOVERING`, a timeout, or a lost response as failure. Continue status lookup and prevent a new payment for the same attempt.
- Keep PC callback and mobile redirect behavior explicit. A direct visit to `/payments/result` must work through the static-host rewrite configuration.
- Never persist or log Payple `PCD_AUTH_KEY`, `PCD_PAY_REQKEY`, full callback payloads, or card information.
- Automated tests must use a browser adapter/mock. A real-card smoke test is a separate, explicitly authorized manual procedure.

## Static deployment and completion

- When adding a route, verify both client navigation and direct URL/reload through `infra/cloudfront-rewrite.js` and the deployed behavior.
- Keep `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_KAKAO_CLIENT_ID` as build-time public configuration and fail clearly when required configuration is missing.
- Before handoff, run lint, TypeScript, and build for behavioral changes. Report the existing lint warning separately from new failures.
- Update the backend contract documentation and `remy-backend/docs/adr/` when a payment, reservation, authentication, or deployment decision changes.

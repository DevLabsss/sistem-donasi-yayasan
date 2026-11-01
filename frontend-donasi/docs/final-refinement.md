# Final website refinement — 29 October 2026

## Changes

- Kept the existing forest green, orange and off-white visual system. Increased small transparency dashboard text, chart height, and added the time the report was generated. Negative balances remain visible with an explicit review warning.
- Donation creation accepts an optional UUID request ID, stored uniquely. Retries with the same ID return the existing pending transaction. Admin verification uses a conditional update and balance increment in one database transaction.
- Receipt upload uses a scoped, expiring token for guest donations and an account token for the owner or administrator. The QRIS modal uploads a selected image once and shows success only after the server responds. Admin receipt deletion now updates the database.
- Public transparency and public program responses omit beneficiary identity, freeform disbursement notes, and private donation details. Receipt files are not exposed by the public static uploads route; owners and administrators retrieve them through an authenticated API endpoint.
- Added public metadata, route titles, noindex on account pages, and build output for robots.txt. A sitemap and canonical URL are generated only when `VITE_SITE_URL` is set to the verified public HTTPS origin.
- Removed unsupported “100% safe and verified” language from the quick donation widget. Cleaned project lint warnings and errors without disabling rules.

## Verification

- Frontend `npm run lint`, `npm test -- --run` (10 tests), and `npm run build`: passed. Modal tests cover minimum amount, duplicate submission, one receipt upload, and upload failure feedback.
- Backend targeted `node --test` (8 tests) and `npx prisma validate`: passed. Prisma client regenerated.
- Chrome/Selenium checked viewport widths 320, 390, 768, 1024, 1440 and 2880 px: document width matched viewport. Mobile menu opened, followed the Gallery link, and closed. At 2880 px, About and Gallery sections remained capped at 880 px height.
- These tests use mocked database operations and a frontend without a running backend. They do not prove live QRIS settlement, production database migration, receipt storage durability, payment-provider reconciliation, Lighthouse scores, or complete WCAG 2.2 AA conformance.

## Deployment and content limits

- Apply the `requestId` database migration before enabling the revised donation endpoint, or allow the existing startup schema sync to add the unique nullable column. On an existing database, check Prisma migration history before running `migrate deploy` after startup schema sync.
- Set `VITE_SITE_URL` to the actual verified HTTPS domain to emit the canonical URL and sitemap. Verify public contact and social accounts before publication.
- The database has no disbursement verification state, beneficiary disclosure consent, payment-provider webhook, fee/refund ledger, or verified donor count. The public site therefore describes disbursements as **recorded**, does not disclose recipient names, and does not claim payment settlement automatically.
- Privacy policy and terms pages were not added because approved legal text is not available. Program images depend on uploads; the gallery labels illustrative images as illustrations.
- Receipt files remain on local server storage and require a persistent private volume in production. Existing copies already served by external caches cannot be recalled by this code change.

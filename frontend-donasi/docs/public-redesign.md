# Public website design audit

## Existing application

- React 19, Vite 8, React Router 7, Tailwind 3, Lucide icons. No type-check or test script existed at audit time.
- `/` contains the approved hero and the `tentang`, `program`, `transparansi`, `galeri`, `donasi` sections; contact was a generic city map.
- Authentication: `/login`, `/register`, `/forgot-password`, `/reset-password/:token`.
- Protected experiences: `/donatur`, `/penerima`, `/admin`. Preserve role guards and API payloads.
- Navbar, Footer, WhatsAppChat, ModalDonasi, Notice, StatusBadge, ProfilSaya and currency/status helpers are reusable.
- Approved hero: Plus Jakarta Sans + Amiri, forest #073f33, secondary #0e5444, orange #f5821f, gold #f4ba42; translucent navigation, rounded cards and buttons. Keep its markup/CSS unchanged.

## Data constraints

- GET /program returns id, judul, deskripsi, targetDana, terkumpul, createdAt, donasi and penyaluranBantuan. There are no category, image, or active/closed status fields. Do not fabricate them.
- Collected donations must use hitungTerkumpul / sumDonasiBerhasil (only BERHASIL transactions). Pending and failed payments do not count.
- GET /donasi/transparansi supplies aggregate successful donations, disbursements and program reports.
- No standalone program detail route existed. Add accessible details to the existing catalogue, using the same records and donation modal.
- Gallery had three stock photos and one local photograph. Use the local existing photograph, with its existing caption; stock images are not foundation documentation.
- Assistance uses GET /pengajuan/saya, GET /penyaluran/saya, GET /profil and POST /pengajuan. No document upload endpoint exists. Preserve admin verification and explain document preparation without pretending uploads work.
- No verified street address / office map coordinates, foundation history, team roster or legal credentials exist. Do not invent them.
- Footer phone and WhatsApp support number differ; keep them as separately labelled existing channels. Retain existing Facebook/Instagram accounts; generic TikTok/YouTube homepage links are not verified accounts.

## Implementation scope

Redesign the existing public sections, authentication, recipient application and donor-facing surfaces. Keep existing routes, add no parallel copies of pages, retain the approved hero and backend. Shared styles are scoped away from the hero and admin. Shared dialog, headings, states and program progress reduce repetition. Contact links reuse existing details. Loading, error and empty states remain distinct.

## Baseline checks

Before edits, global ESLint reported 31 errors and 2 warnings, including existing admin hook errors and unused imports. Record final verification separately; do not mask unrelated errors or weaken rules.

## Shared implementation

- `styles/public-design.css`: public design tokens, type scale, buttons, fields, cards, pagination, responsive grids, auth/member layouts and modal styles. Scope is `.public-ui`; hero CSS is unchanged.
- `components/PublicUI.jsx`: section heading, empty/loading states, successful-only program progress, native accessible dialog, and shared auth layout.
- `components/PasswordField.jsx`: labelled password input with accessible visibility control.
- `components/PublicSections.jsx`: existing public anchors, searchable/paginated catalogue, program details, real local gallery/lightbox, reports, assistance guidance and contact information.
- `hooks/useApiResource.js`: existing GET contracts with separate loading/error/empty states, retry and stale-response protection.
- `data/foundation.js`: existing telephone, WhatsApp, email, bank and social links in one place.
- Existing Notice, StatusBadge, ModalDonasi, ProtectedRoute, status helpers and recipient submission validation are reused. Existing donation/assistance dialogs use the shared native dialog for keyboard focus and Escape.
- Admin code is loaded on demand; the public page no longer downloads the admin screen in its initial bundle.

## Verification — 26 October 2026

- Approved hero JSX and `home-hero.css` compared byte-for-byte with the pre-redesign copy: unchanged.
- Production build passes. Initial JS bundle is 459.83 kB (139.99 kB gzip), with admin in a separate 110.13 kB chunk; no large-chunk warning.
- ESLint passes for every JS/JSX file changed or added by this redesign.
- Full-project ESLint still reports 22 existing errors and 2 warnings in unrelated admin/profile/image utility files (baseline: 31 errors and 2 warnings). Rules were not weakened.
- No project type-check or test script exists. Browser validation was run with local Chrome/Selenium and intercepted XHR fixtures, not live writes.
- Checked public layout at widths 320, 375, 768, 1024 and 1440 px; no horizontal overflow outside intentionally scrollable account tables.
- Checked all existing public/auth routes; recipient and donor routes with fixture tokens; footer cross-route anchors and navbar active section detection.
- Checked catalogue search, genuine empty state, pagination, details, reports, related donation CTA and gallery lightbox.
- Checked successful-only donation totals with fixtures containing BERHASIL, PENDING and GAGAL records and deliberately inconsistent cached totals.
- Checked quick donation preset/custom amount and anonymity propagation; existing POST /donasi payload, pending QRIS stage and PUT proof upload.
- Checked recipient registration payload, mismatch feedback, password visibility, login errors and role redirect, forgot/reset password payloads and success feedback.
- Checked assistance field validation, unchanged POST /pengajuan body, success confirmation, MENUNGGU tracking and detail display.
- Checked focus stays in dialogs, Escape dismissal, mobile-menu Escape and modal header contrast. No uncaught runtime exceptions in the exercised browser flows.
- Checked program/report request failures separately from empty successful responses, and verified retry behavior. Request failures do not render fictional zero balances.

## Remaining limits at the 26 October review

No new backend fields, routes or migrations were introduced. Program images/categories/status, foundation history/team/legal credentials, precise office coordinates and assistance uploads remain unavailable because the existing data does not support them. Contact details retain the project's previously published values; external accounts were not independently verified. Live backend/database/payment delivery should be tested in the deployment environment; all mutation checks here used fixtures.

The 29 October refinement supersedes the backend and lint status above; see [final-refinement.md](final-refinement.md).

## Recipient status flow — 29 October 2026

- The recipient dashboard now shows a live progress track for the newest application: submitted, waiting for review, decision, and disbursement. The detail dialog shows the same track for each older application.
- Pending applications stop at “waiting for review”; rejected applications end at the decision step. Approval alone does not mark disbursement complete. The last step completes only when the recipient's disbursement record includes the exact application reference (`Pengajuan #ID`).
- If the record lacks that reference, the dashboard says disbursement is not recorded **for that application**. The current database has no formal `pengajuanId` relation on disbursements, so this is a careful display of existing data rather than an invented workflow state.
- Verified with 13 frontend tests, lint, production build, and browser checks at 320, 390, 768, and 1440 px using local example responses. No live account or database record was changed.

## Recipient application fixes — 29 October 2026

- A notice can be closed explicitly and now disappears automatically after six seconds. Opening a new application clears an older notice.
- The status page shows a selectable flow for every application, including earlier and canceled ones. Submitting another application selects its flow when the refreshed list arrives.
- A recipient may cancel only their own pending application. Cancellation is recorded as `DIBATALKAN`; it remains in history and cannot be approved or rejected afterward. The admin view can filter and inspect canceled applications.
- Requires the `20261029010000_add_application_canceled_status` migration or startup schema sync before using the cancel endpoint. The API uses a conditional database update so cancellation and admin verification cannot both succeed.
- Latest verification: 17 frontend tests, 10 backend tests (including cancellation and verification race), frontend lint and build, plus browser checks at 320, 390, 768, and 1440 px with four sample applications.

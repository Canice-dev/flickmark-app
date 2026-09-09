# Flick Mart — Two-Week Functional Demo Plan

## 1. Goal and release boundary

Build a **functional demo** of Flick Mart: a native Android/iOS marketplace for Enugu where authenticated users publish listings and buyers discover, save, report, call, or WhatsApp sellers. The release is for validating the experience, not an app-store-ready public marketplace.

### Included

- Google, Apple, and passwordless-email-code authentication through Clerk.
- Signed-in browse experience; every account can buy and sell.
- Seller profile: display name and profile photo required before publishing.
- Listing categories are stored as validated text, rather than in a separate table: Apartment, Self-Contained, Semi self-contained, Single room, Shop/Store, Land, Electronics, Item, or Others.
- A shared listing form: one to six images, title, category, price, description, address, city, public latitude/longitude map pin, phone and WhatsApp contacts, and compliance confirmation. The first image is the cover image.
- Listing creation limit of five per seller per day and five active listings per seller.
- Listing states: active, paused, sold, expired, deleted. Active listings expire after 30 days; the seller sees an in-app renewal banner.
- Browse/search by keyword, category, price range, neighborhood/distance, newest-first; favorites.
- Listing detail with call and WhatsApp buttons; WhatsApp has a prefilled message containing the listing title.
- Reporting, analytics events, legal/safety content, and account deletion that removes the account’s listings, photos, favorites, and related data.
- Expo Router API routes, Neon Postgres, Drizzle, Cloudinary signed uploads, and an interactive map.

### Explicitly deferred

- In-app payments, checkout, orders, delivery, and chat.
- Tailored category-specific forms and filters (the shared form supersedes the earlier tailored-fields request for this demo).
- Push/email expiry reminders, subscriptions, promoted listings, automated moderation, a dedicated admin UI, Sentry, and production launch hardening.

## 2. Confirmed technical baseline

- Existing app: Expo SDK `~57.0.20`, Expo Router `~57.0.19`, React Native `0.86.3`, TypeScript, and NativeWind.
- Server: Expo Router API routes in `src/app`, deployed as a server bundle. API routes require `web.output: "server"` and a deployed server origin for production native builds; the current `app.json` uses static output and must be updated during implementation.
- Database: Neon Postgres, accessed only from server routes with Drizzle and SQL migrations.
- Auth: Clerk. Use the Expo-SDK-compatible package versions selected by `npx expo install`, with Clerk dashboard providers enabled for Google, Apple, and email codes. Store sessions securely on device.
- Media: Cloudinary direct signed uploads using short-lived, server-generated upload signatures. Never expose the Cloudinary API secret to the app.
- Maps: Google Maps was selected. See the decision gate below before implementation.

## 3. Required decision gate: cross-platform map implementation

Expo SDK 57 documents `expo-maps` as alpha, unavailable in Expo Go, and Google Maps only on Android (iOS uses Apple Maps). This does not meet a literal “Google Maps on iOS and Android” requirement.

On Day 2, choose one path and record it in the README:

1. **Recommended demo path:** use `expo-maps` with Google Maps on Android and Apple Maps on iOS; require a development build. The listing coordinate model and UI behavior remain the same.
2. Use a maintained third-party cross-platform map library that supports Google Maps on iOS, after verifying Expo SDK 57 compatibility and native configuration.
3. If map configuration blocks the demo, temporarily use a coordinate/address input and open the listing location in the device map app. This is a demo fallback, not the desired product experience.

Do not request device location permission unless implementing a “near me” control. Sellers can select a pin manually; buyers can use the stored pin for distance filtering without granting location access.

## 4. Data model and source of truth

Neon is the source of truth. Clerk is the identity provider; store only `clerk_user_id` and app-specific profile data in Neon.

| Entity | Essential fields and constraints |
| --- | --- |
| `profiles` | `id`, unique `clerk_user_id`, display name, profile-image URL, timestamps. Profile must be complete before publishing. |
| `listings` | Owner profile, validated text category, title, ordered image URLs, seller-selected `is_featured` boolean, description, required numeric price, address, city, public `latitude`/`longitude`, required phone and WhatsApp contacts, lifecycle status, created/updated/expiry timestamps. Active and sold listings appear in discovery; sold listings show a badge. |
| `listings.image_urls` | Required PostgreSQL `text[]` of one to six ordered Cloudinary secure delivery URLs. The first URL is the cover image. Cloudinary public IDs are derived and validated from the signed upload response before a listing is created. |
| `favorites` | Unique pair of profile and listing; cascade delete with profile/listing. |
| `reports` | Reporter, listing, reason category, optional detail, timestamps, review status. Reports remain operationally visible only while the underlying data exists. |
| `analytics_events` | Event name, anonymous/session or actor reference as permitted, listing/category-text context, timestamp; never store WhatsApp/call contents. |
| `listing_creation_events` or queryable timestamps | Supports five-created-per-day enforcement. |

### Validation and authorization

- API routes derive the actor from a verified Clerk session; never trust a profile ID supplied by the app.
- Only a listing owner can alter, pause, sell, delete, or renew it.
- Reject creates after five in the current rolling/calendar day and publishes after five active listings.
- Validate that one to six uploaded Cloudinary assets belong to the authenticated actor, plus field lengths, category values, Nigerian phone formats, finite coordinates, and a positive price server-side.
- Account deletion runs server-side: delete Cloudinary assets first/with a recoverable job strategy, then cascade-delete Neon records and revoke/deactivate the Clerk account according to the Clerk-supported flow. Handle partial failure idempotently.

## 5. App and API shape

### Route groups/screens

- `(auth)`: sign-in/sign-up entry and Clerk callback handling.
- `(app)/home`: latest active listings, category entry points, search/filter sheet.
- `(app)/listing/[id]`: listing detail, carousel, favorite, report, call, WhatsApp, map preview.
- `(app)/sell`: profile-completion gate, shared listing form, photo upload, pin picker, preview/publish.
- `(app)/favorites`: saved active listings.
- `(app)/profile`: public seller profile and seller dashboard (active/paused/sold/expired listings, renewal banner).
- `(app)/settings`: account, safety/legal links, deletion request/action.

### API route responsibilities

- `GET /api/listings`: validated cursor/page query and filters; only active listings for public discovery.
- `POST /api/listings`, `GET/PATCH/DELETE /api/listings/:id`: create/manage listings with server-enforced limits and ownership.
- `POST /api/uploads/signature`: authenticate the actor and return a short-lived Cloudinary upload signature and constrained upload parameters. The client uploads directly to Cloudinary, then sends the returned secure URLs and public IDs to `POST /api/listings`.
- `POST/DELETE /api/favorites`: toggle/list favorites.
- `POST /api/reports`: create a report with rate limiting and reason validation.
- `GET/PATCH /api/profile`: profile completion and account data.
- `POST /api/account/delete`: idempotent cascade-deletion workflow.
- `POST /api/events`: allowlisted analytics events only.

Use route-specific loading, empty, retry, and error states. Make mutation responses return the authoritative record so the client can update local UI without guessing.

## 6. External setup checklist

Before coding integration work, create organization-owned accounts and document ownership in a private deployment checklist:

1. Clerk: native app configuration, Google, Apple, and email-code providers; production/development redirect URLs; server verification credentials.
2. Neon: separate development and demo databases, least-privilege connection strings, backups/branching policy.
3. Cloudinary: API secret restricted to the server environment, unsigned uploads disabled, per-user upload folder convention, allowed image MIME types/size limits, transformation policy, and delivery-domain configuration.
4. Google Cloud/maps: billing project, restricted API keys, and the platform-specific SDK APIs dictated by the Day-2 map decision.
5. Expo/EAS: project ownership, Android package ID, iOS bundle ID, development-build credentials, server hosting/origin.

Use `.env.example` with variable names only. Commit neither secrets nor real URLs containing secrets.

## 7. Two-week execution sequence

### Days 1–2 — foundation and decisions

1. Read the Expo SDK 57 versioned docs before code changes; install packages through `npx expo install` to preserve SDK compatibility.
2. Create the environment-variable contract and organization-owned service projects.
3. Change Expo configuration for server output/API deployment and establish the server origin strategy.
4. Complete the map decision gate on physical Android/iOS development builds.
5. Add Drizzle configuration, initial migration, category validation, and a Neon connection test through an API route.
6. Add Clerk provider, protected route structure, and sign-in flow for the three chosen methods.

### Days 3–5 — seller foundation

1. Build profile completion/editing and server-side profile authorization.
2. Implement the Cloudinary signed upload flow: permit one to six photos, show upload progress, preserve the selected order, and delete abandoned uploaded assets where practical.
3. Build the shared listing form, manual map pin selection, field validation, transactional create endpoint for the listing and its images, and enforced daily/active limits.
4. Implement listing draft/preview behavior only if it fits; otherwise keep the form in memory and publish directly.

### Days 6–8 — marketplace experience

1. Implement listing feed, pagination, category browsing, keyword and price filters, newest-first sort, and empty/error states.
2. Implement listing detail, image carousel, public seller profile, map preview, favorite toggle, WhatsApp deep link, and phone deep link.
3. Add seller dashboard with edit, pause, mark-sold, delete, and renew operations; calculate/display expiry status.

### Days 9–10 — trust, privacy, and completion

1. Add reporting, compliant-listing confirmation, prohibited-items/safety content, Terms, and Privacy links.
2. Add allowlisted analytics events and verify no contact-message contents or secrets are logged.
3. Implement account deletion with tested database cascades and Cloudinary cleanup; make retries safe.
4. Add basic API rate limits for listing creation, reports, upload-auth generation, and events.

### Days 11–12 — hardening and demo readiness

1. Test on real Android and iOS development builds: sign-in, upload, pin selection, listing lifecycle, search, favorite, report, external contacts, and deletion.
2. Test slow/offline/error behavior for loading feed, image upload, expired auth, and failed API requests.
3. Seed clearly labeled demo accounts/listings; verify database-dashboard report workflow.
4. Fix only launch-blocking defects. Do not add deferred features.

### Days 13–14 — acceptance and handoff

1. Run the acceptance checklist below with a fresh buyer account and seller account.
2. Verify secrets are absent from source control and API routes reject unauthenticated/unauthorized mutations.
3. Produce a short operator guide: how to review reports in the database, deactivate a listing, check quotas, and rotate keys.
4. Build/distribute the demo development build or internal test build. Do not promise app-store approval within this timeline.

## 8. Acceptance checklist

- A new user can complete Google, Apple, or email-code sign-in and cannot browse application screens unauthenticated.
- A completed profile can create a listing with one to six valid Cloudinary-hosted images and a public map pin.
- The API rejects a sixth daily create and a sixth active listing.
- A buyer can find an active listing with search/filtering, save it, open its seller, call, and launch WhatsApp with the listing title prefilled.
- Seller lifecycle actions change what buyers can discover; expired listings do not appear as active.
- A report records a valid queue item visible in the database dashboard.
- Unauthorized actors cannot edit/delete another seller’s listing or upload on behalf of another user.
- Deleting an account removes its profile, listings, favorite records, and Cloudinary assets without leaving public listing data behind.
- The app has understandable loading, empty, validation, offline, and API-failure states on Android and iOS.

## 9. Known risks to actively manage

- Exact public pins may expose homes. Add clear publish-screen guidance to use a safe meetup point where appropriate.
- Unverified per-listing contact numbers enable impersonation/spam. This is accepted demo risk; phone verification is a strong v2 candidate.
- Auto-publishing means prohibited/scam content can appear until manually removed.
- Deleting all user data removes moderation evidence; this should be reconsidered before a public launch.
- Direct database moderation is acceptable only for a tightly controlled demo.
- No crash/error monitoring limits diagnosis; move Sentry or equivalent into the first post-demo iteration.
- API routes need a secure deployed server and origin; static-only Expo web export is insufficient.

## 10. Post-demo / v2 candidates

- Seller subscriptions and promoted listings with a Nigerian payment provider.
- Sentry crash/error monitoring and production alerting.
- Automated text/image moderation and a protected moderator dashboard.
- Verified seller contact numbers and business verification.
- Tailored category forms/filters, richer location privacy controls, push/email reminders, and in-app messaging.

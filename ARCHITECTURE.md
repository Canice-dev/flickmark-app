# Flick Mart Architecture

## Purpose

This document defines the technical architecture for the Flick Mart functional demo. It is the reference for technology choices, system boundaries, data ownership, deployment, and security rules.

## Architecture at a glance

```text
Android/iOS Expo app
  |  Clerk session token over HTTPS
  v
Expo Router API routes (same repository; deployed server)
  |-- verifies Clerk identity and enforces authorization
  |-- Drizzle ORM ------------------------------> Neon Postgres
  |-- short-lived upload credentials ----------> ImageKit
  |-- allowlisted product events --------------> Analytics store/provider (TBD)
  |
  +--> returns only public/authorized data to the app

Expo app -- signed direct image upload --------> ImageKit CDN/storage
Expo app -- map rendering/pin selection -------> chosen native maps provider
Expo app -- tap action ------------------------> WhatsApp / phone dialer
```

The mobile app is an untrusted client. It never has database credentials, ImageKit private credentials, or Clerk secret keys.

## Technology stack

| Layer | Technology | Status | Responsibility |
| --- | --- | --- | --- |
| Mobile app | Expo SDK `~57.0.20` | Existing | Android/iOS application runtime and build tooling. |
| Navigation | Expo Router `~57.0.19` | Existing | File-based mobile routes, protected route groups, and API routes in `src/app`. |
| Language | TypeScript `~6.0.3` | Existing | Type-safe application, API, and database code. |
| UI | React `19.2.3`, React Native `0.86.3`, NativeWind `4.2.6` | Existing | Native screens and design-system styling. |
| Server/API | Expo Router API Routes | Planned | Same-repository HTTP API, authentication verification, validation, authorization, and integration credentials. |
| Authentication | Clerk / `@clerk/expo` | Planned | Google, Apple, and email-code sign-in; session management; identity source. |
| Session storage | `expo-secure-store` | Planned | Encrypted Clerk token persistence on device. |
| Database | Neon Postgres | Planned | Durable application data and source of truth. |
| Data access | Drizzle ORM + Drizzle Kit | Planned | Typed SQL, schema definitions, and reviewed migrations. |
| Image storage/CDN | ImageKit | Planned | Direct signed listing-photo uploads, transformations, and delivery URLs. |
| Mapping | Cross-platform native map solution (decision required) | Planned | Pin selection and listing-map display. |
| External contact | WhatsApp deep link and phone dialer | Planned | Buyer-to-seller contact outside Flick Mart. |
| Analytics | Privacy-conscious event tracking provider (TBD) | Planned | Aggregate product events only; no private contact content. |
| Error monitoring | Sentry or equivalent | Deferred to v2 | Production crash and API-error monitoring. |
| Package management | npm / `npx expo install` | Existing | Install Expo-compatible dependency versions. |
| Builds and distribution | Expo development builds; EAS configuration | Planned | Two-week demo distribution to Android/iOS testers. |

## Expo SDK 57 rules

- Read the versioned Expo SDK 57 documentation before implementing or upgrading Expo-specific features.
- Install Expo-related dependencies with `npx expo install`, rather than manually pinning arbitrary versions.
- Keep `expo-router` as the application routing layer; do not add direct external React Navigation imports.
- API routes use `+api.ts` files beneath `src/app` and execute on a deployed server, not on a device.
- API route deployment requires server output (`web.output: "server"`) and a configured production origin. The current static web output must change when API work begins.
- Native authentication/maps may require a development build; do not assume Expo Go supports them.

## Map decision gate

The desired product behavior is an interactive map with public listing pins on both Android and iOS.

Expo SDK 57's `expo-maps` package is alpha, is unavailable in Expo Go, and uses Google Maps on Android but Apple Maps on iOS. Before map implementation, choose and validate one of these options on real devices:

1. Use `expo-maps`: Google Maps on Android and Apple Maps on iOS.
2. Adopt a verified Expo-SDK-57-compatible cross-platform map library that supports Google Maps on iOS and Android.
3. Use a temporary fallback: location/address input plus a device map-app deep link.

Store location as validated latitude/longitude plus a human-readable Enugu locality. Do not request device location permission unless a near-me feature is explicitly implemented.

## Repository layout

```text
src/
  app/
    (auth)/                 # Clerk sign-in and callback screens
    (app)/                  # Authenticated screens: home, sell, favorites, profile
    api/                     # Expo Router +api.ts HTTP handlers
    _layout.tsx              # Root providers and route protection
  components/                # Reusable visual components
  features/                  # Feature-local UI, hooks, validation, types
  lib/
    api/                     # Typed client API wrapper
    auth/                    # Clerk client/server helpers
    db/                      # Drizzle schema, client, queries, migrations config
    imagekit/                # Server signing and client upload utility
    maps/                    # Chosen map-provider adapter
    validation/              # Shared schemas and safe field constraints
  constants/                 # Categories, legal URLs, application constants
drizzle/                     # Generated/reviewed SQL migrations
```

This layout is a target structure; it should be introduced incrementally rather than through an unrelated wholesale rewrite.

## System boundaries and ownership

### Client responsibilities

- Renders UI, gathers listing form data, chooses photos and pins, and displays server responses.
- Holds the Clerk publishable key and obtains a Clerk session token.
- Uploads photos directly to ImageKit only after receiving short-lived server authorization.
- Opens WhatsApp and phone deep links after a user taps an explicit contact button.
- Treats all server responses as authoritative.

### API responsibilities

- Verifies Clerk authentication for every protected operation.
- Maps Clerk user IDs to Neon profiles; never trusts a client-supplied owner ID.
- Validates and authorizes listing, image, favorite, report, and deletion actions.
- Enforces daily creation and active-listing limits.
- Generates ImageKit upload signatures/parameters and validates uploaded-image references before publishing.
- Performs account deletion and image cleanup as an idempotent server workflow.
- Returns safe public DTOs; it must not return secrets, private account data, or deleted records.

### Neon responsibilities

- Stores profiles, categories, listings, images, favorites, reports, lifecycle information, and analytics events.
- Is the sole application-data source of truth.
- Is reachable only from server-side code using a least-privilege connection string.

### Clerk responsibilities

- Authenticates via Google, Apple, and email one-time codes.
- Maintains sessions and identity records.
- Does not replace the app's Neon profile, listing ownership, or authorization rules.

### ImageKit responsibilities

- Stores and transforms listing images.
- Delivers optimized images by CDN URL.
- Does not decide who may publish a listing; Flick Mart's API decides that.

## Data and authorization model

- A `profiles` row is associated one-to-one with a unique Clerk user ID.
- Buyer and seller are capabilities of one account. Publishing is permitted after profile completion; there is no separate seller login.
- A listing belongs to exactly one profile. Only its owner may edit lifecycle state or delete it.
- Only active, non-expired listings appear in discovery endpoints.
- A favorite is unique per profile/listing pair.
- A report records reporter, target listing, reason, detail, and review state.
- Pricing uses integer minor currency units (kobo) to avoid floating-point errors. Contact-price listings have no amount.
- All listing coordinates are public by product decision; the publish UI must warn users not to reveal an unsafe home location.

## API design rules

- Use resource-oriented JSON endpoints and standard HTTP methods.
- Require authentication by default; discovery/legal endpoints are the exception only if product policy later permits public access.
- Validate request bodies and query parameters on the server. Client validation is only for user experience.
- Return predictable error objects with a stable machine-readable code and user-safe message.
- Use cursor pagination for listing feeds.
- Make `POST /api/account/delete` and external cleanup retry-safe; external operations can fail after database work succeeds.
- Rate-limit high-abuse endpoints: listing create, upload authorization, report, sign-in-adjacent callbacks where applicable, and analytics events.

## Security and secret management

| Secret/configuration | Allowed location | Never expose to |
| --- | --- | --- |
| Clerk publishable key | Expo public environment variable | N/A; it is intentionally public. |
| Clerk secret key | Server environment | App bundle, git, client logs. |
| Neon connection string | Server environment | App bundle, git, client logs. |
| ImageKit private key | Server environment | App bundle, git, client logs. |
| ImageKit public key / URL endpoint | Client configuration as necessary | Does not grant privileged upload signing by itself. |
| Map SDK key | Platform-restricted app configuration | Server secrets and unrestricted public repos. |

- Commit `.env.example` only, with placeholders and no real values.
- Restrict map keys to package/bundle identifiers and signing certificates where supported.
- Use separate development and demo Neon databases and service credentials.
- Do not log Clerk tokens, contact numbers, precise coordinates unnecessarily, database URLs, or ImageKit signing values.

## Deployment topology

```text
Expo development/internal build
    -> configured API origin (HTTPS)
        -> Expo Router server deployment
            -> Neon / Clerk server API / ImageKit signing API
```

- The API server and native app live in this one repository, but the server still requires a remote HTTPS deployment for production-like native clients.
- Configure development and demo environment variables separately.
- Use a server host compatible with Expo Router API routes and the required server runtime. Verify compatibility before committing to a host.
- The functional demo should be distributed as an Expo development build or internal testing build. App-store approval is a separate, non-guaranteed release process.

## Observability and operations

For the demo, capture structured server logs with request ID, route, response code, latency, safe actor reference, and safe error code. Do not include secrets or private message contents.

Product analytics records only allowlisted events: authentication completion, listing creation, search, favorite, view, WhatsApp/call tap, and report. It must not capture call/WhatsApp content.

Sentry is deliberately deferred to v2. Before any public production launch, add mobile crash reporting, server error monitoring, alerting, and a protected moderation workflow.

## Non-negotiable constraints

- No purchase, payment, checkout, delivery, or in-app messaging in the demo.
- All user interactions require sign-in before browsing.
- Listings auto-publish after seller compliance confirmation.
- Direct database-dashboard moderation is accepted only for the controlled demo.
- Account deletion removes all user-linked app content by product decision; reassess audit/legal retention before public launch.
- Do not add unapproved third-party services without documenting their role, data access, cost, quota, and failure behavior.

## References

- Expo SDK 57 Router: https://docs.expo.dev/versions/v57.0.0/sdk/router/
- Expo API Routes: https://docs.expo.dev/router/web/api-routes/
- Expo SDK 57 Maps: https://docs.expo.dev/versions/v57.0.0/sdk/maps/
- Expo guide for Clerk: https://docs.expo.dev/guides/using-clerk/
- Product execution plan: [PLAN.md](./PLAN.md)

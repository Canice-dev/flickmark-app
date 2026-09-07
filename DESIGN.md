Design a polished native mobile app UI for “Flick Mart,” a trusted local classifieds marketplace for Enugu, Nigeria. Create a cohesive Android/iOS screen set — not a generic ecommerce template, not a dashboard, and not a social-media clone.

Product:
Flick Mart lets signed-in users discover local listings, save them, publish their own listings, and contact sellers through phone calls or WhatsApp. Every user can buy and sell. There are no payments, delivery, checkout, in-app chat, ratings, or promoted listings.

Visual direction:
Take the quick local-discovery clarity of Facebook Marketplace and Jiji, but make Flick Mart calmer, more premium, and safer. Borrow Airbnb’s restrained typography, spacious layouts, and image-forward browsing. The app should feel useful in everyday Enugu life: direct, warm, contemporary, and credible.

Avoid:

- purple/blue fintech gradients
- oversized hero illustrations
- neon colours
- excessive rounded “pill” cards
- fake ratings, fake sales counts, fake discounts, or lorem ipsum
- generic AI avatars and random stock imagery
- glassmorphism, 3D icons, excessive shadows
- payment/cart/checkout/chat UI

Use realistic Nigerian context:

- Currency: ₦, for example “₦350,000”
- Locations: Independence Layout, New Haven, GRA, Ogui, Thinkers Corner, Abakpa, Emene, Uwani, Nsukka Road
- Categories: Apartment, Self-Contained, Semi self-contained, Single room, Shop/Store, Land, Electronics, Item, Others
- Use natural Nigerian names and believable listings.
- Use authentic listing photography: rooms, phones, appliances, land, shops; no highly staged ecommerce product cutouts.

Colour system:

- Primary ink: #163B35 — deep forest green, used for main actions and selected states
- Brand green: #247A62 — warm emerald for buttons and key highlights
- Accent: #F2B84B — restrained amber for safety notices, sold status, and small accents only
- Background: #FAF8F4 — warm off-white
- Surface: #FFFFFF
- Main text: #1C2523
- Secondary text: #65716D
- Border: #E7E4DE
- Destructive/error: #C4473D
  Use green purposefully; do not make every element green.

Typography and components:

- Native mobile UI, 8pt spacing system.
- Use a clean modern sans serif such as Inter/SF Pro.
- Strong, compact headings; readable 15–16px body text.
- Cards should have modest 12–16px radius, subtle #E7E4DE borders, and nearly invisible shadows.
- Product photos are the visual emphasis.
- Use clear outline icons and accessible tap targets.
- Bottom navigation: Home, Saved, Sell, Profile. Sell is visually distinct but not oversized.
- Build clear loading, empty, validation, offline, and error states.

Create these screens in one connected design system:

1. Welcome / authentication entry

- Warm off-white background, simple Flick Mart wordmark.
- Heading: “Find what you need, close to home.”
- Short supporting text: “Browse local listings and sell with confidence in Enugu.”
- Three full-width actions: Continue with Email, Continue with Google, Continue with Apple.
- Small safety/trust note at the bottom.
- No busy illustration; use one subtle local marketplace photo collage or abstract location-inspired texture.

2. Email sign-in

- Clean back navigation.
- “Welcome back” heading.
- Email address field and Continue button.
- Link for “Create an account.”
- Email-code verification screen with six code cells, resend countdown, change-email action, and clear loading/error states.

3. Home / browse

- Greeting: “Good morning, Adaeze”
- Search field: “Search apartments, phones, land…”
- Location chip: “Enugu”
- Horizontally scrolling category chips with simple icons.
- Section: “Fresh near you”
- Two-column image-led listing grid.
- Each listing card shows image, title, location, price, and compact save icon.
- Include a “See all” action and a slim “Stay safe when meeting sellers” card.
- Bottom navigation visible.

4. Search and filters

- Search results screen with a persistent search field.
- Filter button opens a bottom sheet for category, price range, neighborhood/distance, and newest-first sorting.
- Applied filters are removable chips.
- Results should look calm and scannable, not crowded.

5. Listing detail

- Large photo carousel at top with image index.
- Save and report actions in the header.
- Listing title, price, category, location, and posted date.
- A visible map preview with a privacy note: “Location shown is approximate.”
- Seller section with profile image, name, and “View profile.”
- Sticky bottom actions: Call seller and WhatsApp.
- Add a compact safety notice: “Inspect before you pay. Never send money in advance.”
- Include a clear “Sold” variation.

6. Create listing flow

- Step-based but lightweight: Details → Location → Preview.
- Progress indicator at top.
- Photo upload area supports one required listing image, with upload progress.
- Form fields: title, category, price/contact price, description, address, city, phone, WhatsApp.
- Map pin selector with an explicit warning: “Use a safe nearby landmark if this is your home.”
- Compliance checkbox: “This listing follows Flick Mart’s safety rules.”
- Show concise inline field validation — no modal error dumping.

7. Listing preview and publish confirmation

- Preview looks like the live listing detail screen.
- Main CTA: “Publish listing”
- Explain: “Your listing will be visible to buyers immediately.”
- Published success screen should be simple, with options “View listing” and “Back to home.”

8. Saved listings

- Title: “Saved”
- A clean two-column grid of favorite listings.
- Empty state uses a restrained bookmark illustration and copy: “Save listings to find them again.”

9. Seller profile and dashboard

- Personal profile header with photo, display name, and Edit profile.
- “My listings” segmented control: Active, Paused, Sold, Expired.
- Listing management cards with contextual actions: Edit, Pause, Mark as sold, Renew, Delete.
- Show an amber renewal banner only for listings nearing expiry.
- Show a profile-completion gate before the first listing: photo and display name required.

10. Settings and safety

- Grouped native-settings list: Account, Safety centre, Terms, Privacy, Delete account.
- Deleting account is a deliberate destructive flow with explicit warning that listings and saved items will be removed.
- Safety centre uses direct, readable advice; do not make it look like a legal document.

Design the screens as a believable production-quality mobile prototype. Ensure every state, label, and interaction supports a local peer-to-peer marketplace where trust and clarity matter more than visual decoration.

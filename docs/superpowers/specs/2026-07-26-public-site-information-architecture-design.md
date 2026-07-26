# Public Site Information Architecture Refresh

## Goal

Reframe the public TGT Holdings website around six clear entry points while preserving the existing, evidence-backed company and research content. The refreshed navigation must be consistent on desktop, mobile, footer, sitemap, and internal calls to action.

## Public navigation and routes

| Navigation label | Canonical route | Existing source |
| --- | --- | --- |
| Home | `/` | Existing home page |
| Research | `/research` | Existing Ideas page and posts |
| About Us | `/about-us` | Existing Who We Are page |
| What We Do | `/what-we-do` | Existing How We Work page |
| Career | `/career` | Existing Careers page |
| Contact Us | `/contact-us` | Existing Contact page |

The former routes (`/ideas`, `/who-we-are`, `/how-we-work`, `/careers`, and `/contact`) will issue permanent redirects to their canonical replacements. No claims, roles, performance figures, or contact information will be invented or expanded as part of this work.

## Experience direction

The site will retain its dark, disciplined financial-technology identity, but make the page system feel more intentional and editorial:

- A slim, high-contrast header with the six canonical links and an equivalent accessible mobile menu.
- A shared page-shell treatment for the five informational pages: compact mono eyebrow, large display heading, concise lead, and restrained ruled sections.
- Research remains an index of the existing research posts, renamed without changing post content or data fetching.
- Existing home sections stay intact, with navigation and cross-page calls to action updated to canonical destinations.
- The footer will expose the same public information architecture, avoiding a conflicting second navigation model.

## Typography system

- **Bricolage Grotesque** is the display face: page titles, hero statements, and prominent section headings.
- **Geist Sans** is the body face: navigation, descriptive copy, controls, and cards.
- **Geist Mono** is reserved for labels, metadata, route markers, and technical accents.

All three faces will be loaded through `next/font/google` and exposed as global CSS variables. The body defaults to Geist Sans; display classes opt into Bricolage Grotesque; mono annotations opt into Geist Mono. No externally hosted CSS font request is required at runtime.

## Component and data boundaries

- A single navigation data source defines label, canonical URL, and active state for the header and footer.
- Route-specific page modules own their metadata and content composition.
- The existing blog loader remains the sole source for Research posts.
- Redirect handling lives at the route boundary, so legacy URLs do not duplicate page implementations.

## Responsive and accessible behavior

- Desktop navigation remains visible from the medium breakpoint; mobile navigation opens in a labelled full-screen overlay and closes after navigation.
- All links retain visible hover and keyboard-focus states.
- Header active state follows the canonical pathname.
- Typography preserves readable line lengths and keeps display headings fluid across small and large screens.

## Validation

- Run lint and production build after implementation.
- Check canonical and legacy routes, including direct navigation to each former route.
- Inspect desktop and mobile layouts locally to confirm all six links, typography roles, and the mobile menu behave as specified.

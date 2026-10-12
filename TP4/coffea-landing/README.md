# Coffea — Landing Page

Static, single-page landing for the fictional coffee shop **Coffea**. Built with
semantic **HTML5 + CSS3** only: no JavaScript, no frameworks, no preprocessors,
no bundlers.

## Stack

- HTML5 (semantic) + CSS3 (custom properties, Flexbox, Grid, scroll-snap, `@layer`).
- Design tokens centralized in `css/tokens.css`.
- Google Fonts: Playfair Display, Outfit, Poppins, Reggae One.

Out of scope (by design): JavaScript, Tailwind, Sass, bundlers, CMS, backend,
Internet Explorer.

## Structure

```
coffea-landing/
├── index.html                # Landing page (9 sections)
├── 404.html                  # Not-found page (shared header + footer)
├── netlify.toml              # Deploy config, cache and security headers
├── README.md
├── css/
│   ├── main.css              # declares the @layer cascade order
│   ├── fonts.css             # self-hosted @font-face (woff2, latin subset)
│   ├── tokens.css            # design tokens (colors, type, radii, spacing)
│   ├── base.css              # modern reset, base typography, :focus-visible
│   ├── layout.css            # .container, section grids, color bands
│   ├── utilities.css         # .visually-hidden and helpers
│   └── components/
│       ├── header.css
│       ├── hero.css
│       ├── categories.css
│       ├── product-card.css
│       ├── carousel.css
│       ├── promo.css
│       ├── testimonial-card.css
│       ├── newsletter.css
│       ├── error-page.css
│       └── footer.css
└── assets/
    ├── img/                  # AVIF photos (+ JPG fallback via <picture>)
    ├── fonts/                # self-hosted woff2 (Playfair, Outfit, Poppins, Reggae One)
    └── icons/                # optimized SVG (SVGO)
```

## Layers and cascade

`css/main.css` declares the layer order once:

```css
@layer tokens, base, layout, components, utilities;
```

Every stylesheet wraps its rules in its own `@layer` and is linked directly from
the HTML (no `@import` chain), so the cascade order holds and no `!important` is
ever needed.

Styles are mobile-first: base rules target 360 px and `@media (min-width: …)`
steps up through `md` (768 px), `lg` (1024 px) and `xl` (1440 px).

## Conventions

- **BEM** naming: `.product-card`, `.product-card__title`, `.product-card--featured`.
- **No loose values**: every color, font, radius and spacing references a token
  from `css/tokens.css`.
- **Units**: `rem` for type and spacing, `clamp()` for fluid headings.
- **Layout** with Flexbox/Grid; `position: absolute` only for overlaps
  (header over hero, favorite heart, decorative images).

## Run locally

No build step. Serve the folder with any static server, or just open
`index.html`:

```bash
# Option A: Python
python -m http.server 8080

# Option B: Node
npx serve .
```

Then open <http://localhost:8080>.

## Deploy (Netlify)

Continuous deploy from the Git repository. `main` publishes to production and
each Pull Request gets a Deploy Preview.

- Build command: none (pure HTML + CSS).
- Publish directory: `.` (project root), declared in `netlify.toml`.
- `netlify.toml` also sets cache headers for `/css/*` and `/assets/*`
  (`immutable`), so changed files must be versioned (e.g. `main.v2.css`).

## Quality targets

- Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices / SEO ≥ 95.
- W3C validators: 0 HTML errors, 0 CSS errors.
- First-load page weight ≤ 1.5 MB.
- No horizontal scroll between 360 px and 1920 px.
- WCAG 2.2 AA contrast; full keyboard navigation.

## Known placeholders

Copy and product data are placeholders pending final content:

- Product cards repeat `Lungo coffee` / `Rs. 200`; desserts are placeholders.
- Testimonials use `James Smith` / `Lorem ipsum`.
- Currency `Rs.` pending confirmation (ARS/`$`?).
- `og:image` points to a placeholder URL until a real OG image is exported.

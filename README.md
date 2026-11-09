# Crona Atelier — Completed demo

A fictional multilingual design storefront. React + TypeScript + Vite, static hosting through Sites. No payments, backend or real store location.

## Run and check

npm install, npm run dev, npm test, npm run build.

## Implemented

- Stage 1: cinematic intro with Skip, EN/RU/nb language selection, welcome notice, returning-visitor behavior.
- Stage 2: six products, category filtering, price sorting, product dialogs, browser-local saved objects, inventory states, a demo discount, fictional showroom and contact presentation.
- Stage 3: integrated product editor with instant previews, translated fields, image uploads, adding/removing/restoring products, ordering, visibility, grid controls, discounts, Undo/Redo and confirmed Reset Demo.
- Stage 4: first-visit tutorial through the real Edit demo button, Moon card, inventory field and final stock status. Enter or blur commits manual input; a shortcut sets the actual quantity to 1. Skip/Escape, saved completion and replay from Settings are supported in EN/RU/nb. Replay preserves existing edits, including a hidden Moon and an existing quantity of 1.
- Stage 5: improved light-theme contrast and mobile text/control sizes, skip-to-content navigation, reliable dialog focus return and Tab cycling, long-content layout protection, and a hero category that reflects editor changes.
- Shared settings: language, light/dark theme, replay intro and welcome. Dialogs support Escape, native focus containment and focus return.
- Responsive layouts and reduced-motion support. Header language changes happen in place.

## Data and persistence

src/store/catalog.ts contains stable IDs and localized default product data. inventoryState derives status for 0, 1, 2 and 3+ items. The Moon starts at exactly 1337 units and cannot be removed, but can be edited or hidden. effectivePrice is shared by sorting, cards and details. The editor passes its live catalog to Storefront.

Browser keys: crona-atelier:onboarding:v1, crona-atelier:theme:v1, crona-atelier:saved:v1, crona-atelier:tutorial:v1. Theme restoration runs before first render. Storage failures keep the interface usable and display an explanation. No browser state is shared between visitors.

Editor data uses crona-atelier:editor:v1 in localStorage, separate from preferences and favorites. Uploaded blobs use the crona-atelier-images IndexedDB database. Files are decoded locally, limited to JPEG/PNG/WebP, 8 MB and 40 megapixels, then resized to a maximum dimension of 1600 px. No image is uploaded to a server. A failed upload leaves the previous image intact.

Undo/Redo keeps up to 60 edits in memory and groups consecutive edits to the same field until blur. History does not survive reload; the edited catalog does. Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl+Y apply outside input fields. Images remain available for undo until Reset Demo. The demo supports 40 products (including removed ones) and 80 stored image versions; reset clears all image versions and edit history. Reset preserves language, theme and favorites. Deleted custom-product favorites become visible again only if their product is restored before reset.

Editing shows all non-deleted cards, including hidden products; browse filters and the visible-count limit apply after leaving editing. Grid columns adapt to the available width. The larger of the product and scoped collection discounts applies, never their sum. Text edits affect one chosen locale; numeric fields and images are shared across languages. Desktop uses a left panel; mobile uses a collapsible bottom panel.

## Validation

47 automated tests cover onboarding/themes, catalog rules, editor history and validation, live inventory changes, persistence, visibility, deletion/restoration, promotions, reset, file rejection, dropped uploads and storage errors, tutorial progression, manual input, skip/replay, reduced motion, preservation of existing edits, dialog keyboard navigation and focus restoration. See [the final QA record](docs/final-qa.md) for browser coverage and its limits. Stage 3 additionally verified IndexedDB image persistence across reload and original-image restoration.

## Assets

The built-in image_gen tool generated catalog photography, exported to WebP (about 520 KiB total). Originals and prompts are retained in the parent workspace assets/products folder. docs/catalog-images.md records prompts. Icons are Lucide; flags are flag-icons. Licenses are in public/licenses. Google Fonts uses Georgia/Arial fallbacks.

## Scope

All five planned stages are implemented. Favorites are a saved selection, never a cart. Product details, stock, bestseller status, prices, showroom and contact address are fictional demonstration data. No server-side merchant account, real inventory or checkout exists.

## GitHub Pages

Public site: https://vlevickij683-a11y.github.io/crona-atelier/

The workflow in .github/workflows/deploy.yml checks and builds the project, then publishes dist after every push to main. In repository Settings → Pages, the source is GitHub Actions. VITE_BASE_PATH sets the hosting subdirectory at build time; built-in asset IDs in saved editor data stay unchanged.

The local .openai/hosting.json belongs to the separate Sites deployment and is not required on GitHub.

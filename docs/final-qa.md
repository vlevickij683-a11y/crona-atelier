# Final QA — 2026-11-01

## Fixes made during the final pass

- Light-theme secondary text changed from #817a70 to #6c6358: contrast against the page background #f5f1e8 increases from 3.76:1 to 5.23:1; against the secondary surface #ece5d9 it is 4.71:1. Small bronze text was darkened too. Dark-theme colors are retained.
- Mobile product descriptions, stock text and filter labels are larger. Filter, tutorial-skip and editor-link targets have a minimum height of 44px. Native sort controls use 16px text on narrow screens.
- A translated skip-to-content link and visible keyboard outlines cover navigation links and disclosure summaries.
- Dialogs capture their opener before autofocus, cycle Tab/Shift+Tab at their boundaries, and restore focus on close. When an unsaved card disappears, focus returns to the Saved filter. Direct removal from Saved also keeps a usable focus target.
- The hero category now reflects the Moon's edited category. Unbroken names, subtitles and promotion labels wrap within their cards/panels.
- The image-upload test now awaits the persistence effect as well as the image preview, removing a race between rendering and the assertion of saved data.

## Automated checks

47 tests across 8 files pass. Production TypeScript/Vite build passes. Git whitespace checks pass. No new runtime dependencies were added.

The suite covers initial onboarding, three languages, theme persistence, filtering/sorting, favorites, real product data updates, editor validation/history, product creation/removal/restoration, visibility/limits, discounts/reset, local image error handling, guided tutorial progression and keyboard focus regressions.

## Browser checks

Performed in the available desktop in-app Chromium browser using responsive viewport overrides, not physical mobile devices.

- 320px: storefront filters and empty favorites, actual product dialog, editor with a 98-character unbroken name and long subtitle, 1,000,000,000,000 NOK price, and tutorial inventory step. No horizontal overflow; the tutorial did not overlap its input and the input was inside the viewport.
- 768px and 1440px: long-content product dialog and page fit without horizontal overflow. No broken loaded images.
- 390px: Norwegian and English welcome screens, in-place keyboard language selection and visible light-theme copy.
- Keyboard: Escape closes the product dialog; deleting the last saved item in the dialog returns focus to Saved; settings Tab/Shift+Tab wrap between Close and Reset without activating Reset.
- Editor: category changes appear in the hero; all four temporary stress-test edits were undone to the original Moon name, subtitle, category and price.
- Tutorial: actual Edit demo → Moon selection → quantity 1 → completion; Undo restores 1337. Completed tutorial stays closed after reload.
- Persistence: Russian, dark theme, one previously saved object and original 1337 Moon inventory verified after reload. No browser application errors observed in the local checks.

## Limits

This is a practical functional and responsive audit, not a WCAG certification. Physical touch devices, mobile software keyboards, Safari/Firefox engines and a screen reader were not available for this pass. Image persistence through real IndexedDB was checked in Stage 3; the final pass retained that implementation and ran its automated coverage.

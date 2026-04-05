# Test Implementation Tasklist: map-generator.html

## Infrastructure
- [x] T1: Create `package.json` (vitest, jsdom, @playwright/test)
- [x] T2: Create `vitest.config.js`
- [x] T3: Create `playwright.config.js`

## Refactor for testability
- [x] T4: Extract pure + network functions to `lib/map-utils.js` (ESM exports)
- [x] T5: Update `map-generator.html` — convert `<script>` to `<script type="module">`, import from lib/map-utils.js, expose onclick functions on `window`; also fixed missing `toggleMenu` bug

## Test fixtures
- [x] T6: Create `tests/fixtures/nominatim-triglav.json`
- [x] T7: Create `tests/fixtures/overpass-sac.json` (ways with sac_scale, huts, water)
- [x] T8: Create `tests/fixtures/overpass-fallback.json` (ways without sac_scale)

## Unit tests (Vitest)
- [x] T9:  `tests/unit/difficulty.test.js` — getDifficulty() all inputs
- [x] T10: `tests/unit/bbox.test.js` — capBbox() capping logic
- [x] T11: `tests/unit/query-builders.test.js` — buildSacQuery / buildFallbackQuery

## Integration tests (Vitest + mocked fetch)
- [x] T12: `tests/integration/geocode.test.js` — success, no results, HTTP error
- [x] T13: `tests/integration/overpass.test.js` — success, HTTP error

## E2E tests (Playwright with route interception)
- [x] T14: `tests/e2e/search.spec.js` — initial state, happy path, error, cap banner, fallback mode
- [x] T15: `tests/e2e/layers.spec.js` — trail/hut/water toggles, difficulty filter
- [x] T16: `tests/e2e/gpx.spec.js` — button disabled before search, download after
- [x] T17: `tests/e2e/hut-search.spec.js` — autocomplete, click suggestion, Escape
- [x] T18: `tests/e2e/url-state.spec.js` — ?q= on load, URL updates on search

## Verification
- [ ] T19: Run `npm test` — all unit + integration tests pass
- [ ] T20: Run `npx playwright test` — all E2E tests pass

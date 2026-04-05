# Test Plan: map-generator.html

## Scope

`map-generator.html` is a single-page browser app. It has no build step, no bundler,
and no existing test harness. This plan introduces:

- **Vitest + jsdom** for unit and integration tests (pure functions, mocked fetch)
- **Playwright** for E2E tests (real browser, real or stubbed network)

---

## Test structure

```
tests/
  unit/
    difficulty.test.js      # getDifficulty()
    bbox.test.js            # capBbox()
    query-builders.test.js  # buildSacQuery(), buildFallbackQuery()
  integration/
    geocode.test.js         # geocode() with mocked fetch
    overpass.test.js        # fetchOverpass() with mocked fetch
    do-search.test.js       # doSearch() end-to-end with all fetches mocked
  e2e/
    search.spec.js          # place search UI flows
    layers.spec.js          # layer + difficulty toggles
    gpx.spec.js             # GPX export
    hut-search.spec.js      # hut autocomplete
    url-state.spec.js       # ?q= param on load
```

---

## Unit tests (Vitest + jsdom)

Pure functions extracted from the page script — no DOM, no network.

### U1–U2 · `getDifficulty(sacScale)`

| ID | Input | Expected output |
|----|-------|-----------------|
| U1a | `"hiking"` | `{ key:'T1', label:'T1 – Hiking', color:'#1a7a3a', width:2.5 }` |
| U1b | `"mountain_hiking"` | T2 entry |
| U1c | `"demanding_mountain_hiking"` | T3 entry |
| U1d | `"alpine_hiking"` | T4 entry |
| U1e | `"demanding_alpine_hiking"` | T5 entry |
| U1f | `"difficult_alpine_hiking"` | T6 entry |
| U2a | `"unknown_value"` | `{ key:'unknown', color:'#999999', width:2 }` |
| U2b | `undefined` | same fallback |
| U2c | `""` | same fallback |

### U3–U5 · `capBbox(bbox, centerLat, centerLon)`

| ID | Scenario | Expected |
|----|----------|----------|
| U3 | Bbox well within 50 km | Returns same bbox, `capped: false` |
| U4 | Bbox wider than 50 km on longitude axis | Lon clamped to ±25 km around centre, `capped: true` |
| U5 | Bbox taller than 50 km on latitude axis | Lat clamped, `capped: true` |
| U6 | Both axes oversized | Both clamped, `capped: true` |
| U7 | Centre near equator vs high latitude | `kmPerDegLon` scales correctly (cos projection) |

### U6–U7 · `buildSacQuery(bbox)` and `buildFallbackQuery(bbox)`

| ID | Scenario | Expected |
|----|----------|----------|
| U8 | Call `buildSacQuery("46.0,13.3,46.85,14.25")` | Return value contains `46.0,13.3,46.85,14.25`; contains `sac_scale`; contains `alpine_hut` |
| U9 | Call `buildFallbackQuery("46.0,13.3,46.85,14.25")` | Return value contains the bbox; does NOT contain `sac_scale`; contains `highway~"path\|footway\|track"` |

---

## Integration tests (Vitest + jsdom + mocked fetch)

Load the page script in jsdom, stub `globalThis.fetch`.

### Geocode

| ID | Setup | Scenario | Expected |
|----|-------|----------|----------|
| I1 | fetch returns valid Nominatim JSON | `geocode("Triglav")` | Resolves with correct `{ lat, lon, bbox, displayName }` |
| I2 | fetch returns `[]` | `geocode("xyzzy")` | Rejects with `No results for "xyzzy"` |
| I3 | fetch returns HTTP 500 | `geocode("Triglav")` | Rejects with `Nominatim HTTP 500` |
| I4 | fetch throws (network down) | `geocode("Triglav")` | Rejects (propagates network error) |

### Overpass

| ID | Setup | Scenario | Expected |
|----|-------|----------|----------|
| I5 | fetch returns valid Overpass JSON | `fetchOverpass(query)` | Resolves with `{ elements: [...] }` |
| I6 | fetch returns HTTP 429 | `fetchOverpass(query)` | Rejects |

### `doSearch(query)` (all fetches mocked)

| ID | Mocks | Scenario | Expected |
|----|-------|----------|----------|
| I7 | Nominatim OK; SAC query returns ≥1 trail | Happy path | `setFallbackLegend(false)` called; `renderData(data, false)` called; overlay hidden; title updated; URL has `?q=` |
| I8 | Nominatim OK; SAC returns 0 trails; fallback returns trails | Fallback path | fallback query fired; `setFallbackLegend(true)` called; `renderData(data, true)` called |
| I9 | Nominatim returns no results | Geocode failure | Status text contains "Not found"; spinner hidden; overlay stays visible |
| I10 | Nominatim OK; Overpass throws | Overpass failure | Status text contains "Overpass error"; spinner hidden; overlay stays visible |
| I11 | Nominatim OK; SAC returns bbox larger than 50 km | Cap path | `capBbox` clamps bbox; `#cap-banner` shown |
| I12 | Nominatim OK; SAC returns small area | No cap | `#cap-banner` hidden |

---

## E2E tests (Playwright)

All tests serve the file locally (e.g. `npx serve .` or `python -m http.server`).
Network calls to Nominatim and Overpass are intercepted and stubbed with fixture JSON
so tests are deterministic and offline-capable.

### Search flows (`search.spec.js`)

| ID | Steps | Expected |
|----|-------|----------|
| E1 | Load page | Overlay visible; spinner hidden; message = "Enter a place name above to generate a hiking map"; `#btn-go` not disabled |
| E2 | Type "Triglav", click Go | Overlay shows spinner + "Searching…"; then hides; title = "Triglav, …"; map has trail polylines |
| E3 | Type "Triglav", press Enter | Same as E2 |
| E4 | Type whitespace only, click Go | `doSearch` not called (guard: `if (!query) return`) |
| E5 | Stub Nominatim to return no results; search | Overlay stays visible; `#status` contains "Not found"; spinner hidden |
| E6 | Stub Nominatim to return large bbox (> 50 km wide); search | `#cap-banner` visible after search |
| E7 | Stub Nominatim to return normal bbox; search | `#cap-banner` hidden |
| E8 | Stub SAC query to return 0 trails; search | Legend title changes to generic mode text |
| E9 | After successful search, reload page with `?q=Triglav` | Input pre-filled; search fires automatically |

### Layer toggles (`layers.spec.js`)

After a successful (stubbed) search:

| ID | Action | Expected |
|----|--------|----------|
| E10 | Click "Trails" button | Trail polylines removed from map; button has active/off state |
| E11 | Click "Trails" again | Trail polylines re-added |
| E12 | Click "Huts" button | Hut markers removed |
| E13 | Click "Huts" again | Hut markers restored |
| E14 | Click "Water" button | Water markers removed |
| E15 | Click difficulty row "T3" | T3 polylines hidden; T1/T2 still visible |
| E16 | Click difficulty row "T3" again | T3 polylines restored |
| E17 | Legend expand/collapse | Click `#legend-header`; `#legend-body` toggles visibility |

### GPX export (`gpx.spec.js`)

| ID | Scenario | Expected |
|----|----------|----------|
| E18 | Before search | `#btn-gpx` is disabled |
| E19 | After successful search, click GPX | Download triggered; filename matches place name (`triglav-bohinj.gpx` style); XML contains `<gpx>` and `<trk>` tags |

### Hut search autocomplete (`hut-search.spec.js`)

After a successful (stubbed) search with hut data:

| ID | Steps | Expected |
|----|-------|----------|
| E20 | Type partial hut name in `#hut-search` | Dropdown `#hut-suggestions` appears with matching items |
| E21 | Type non-matching string | Dropdown empty or hidden |
| E22 | Click a suggestion | Dropdown closes; map pans to hut coordinates; marker popup opens |
| E23 | Press Escape with dropdown open | Dropdown closes |

### URL state (`url-state.spec.js`)

| ID | Scenario | Expected |
|----|----------|----------|
| E24 | Successful search for "Bled" | URL becomes `?q=Bled` without full page reload |
| E25 | Load `?q=Bled` cold | Input = "Bled"; search fires on load; map renders |
| E26 | Search twice in same session | URL updates to second query each time |

---

## Out of scope (for now)

- Locate-me (`toggleLocate`) — requires Geolocation API mock; deferred
- Offline / PWA behaviour — not planned
- Accessibility audit — not in this iteration
- Cross-browser matrix — Playwright defaults (Chromium) sufficient for now

---

## Acceptance criteria

All unit and integration tests must pass in CI (`npm test`).
E2E suite must pass locally against the static file server before merging.

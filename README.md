# Hiking Maps

A collection of browser-based hiking map apps. No build step, no backend — open the HTML file via any local server and it fetches live trail data from OpenStreetMap.

## Maps

### Map Generator (`map-generator.html`)

Enter any place name to generate a hiking map of that region. Trails are colour-coded by SAC difficulty scale; huts, springs, and water points are marked as icons. If a region has no SAC-tagged trails the app automatically falls back to generic path/footway/track data.

**Features:**
- Place search with Nominatim autocomplete (type ≥ 2 characters for suggestions)
- Bounding box cap — searches larger than ~50 × 50 km are clamped to the centre with a warning banner
- Layer toggles: Trails, Huts, Water
- Difficulty filter — click any row in the legend to hide/show that grade
- Hut search with accent-insensitive autocomplete and keyboard navigation
- GPX export — all visible trails and waypoints, with Garmin and OsmAnd colour extensions
- GPS locate — live position tracking with accuracy circle
- Shareable URLs via `?q=PlaceName`

### Julian Alps (`julian-alps-map.html`)

Fixed map of the Julian Alps, Slovenia. Same feature set as the generator (layer toggles, hut search, GPX, locate).

### Milford Track (`milford-track-map.html`)

Fixed map of Milford Track, Fiordland, New Zealand.

## Difficulty colours (SAC scale)

| Grade | Label | Colour |
|---|---|---|
| T1 | Hiking | Green |
| T2 | Mountain Hiking | Yellow-green |
| T3 | Demanding Mountain | Amber |
| T4 | Alpine Hiking | Orange |
| T5 | Demanding Alpine | Red |
| T6 | Difficult Alpine | Dark red |

## Running locally

The HTML files use ES modules, so they must be served over HTTP — opening as a `file://` URL will not work.

**Python (no install required):**
```bash
python -m http.server 3000
```

**Node:**
```bash
npx serve . -p 3000
```

Then open `http://localhost:3000/map-generator.html`.

## Testing

```bash
npm install

# Unit + integration tests (Vitest)
npm test

# E2E tests (Playwright — requires Chromium)
npx playwright install chromium
npm run test:e2e

# Both suites
npm run test:all
```

Tests cover:
- **Unit** — `getDifficulty`, `capBbox`, `buildSacQuery`, `buildFallbackQuery`
- **Integration** — `geocode` and `fetchOverpass` with mocked fetch
- **E2E** — search flow, layer toggles, difficulty filter, GPX download, hut autocomplete, URL state (`?q=`)

## Project structure

```
map-generator.html        Main dynamic map app
julian-alps-map.html      Static Julian Alps map
milford-track-map.html    Static Milford Track map
lib/
  map-utils.js            Shared ES module (difficulty, bbox, queries, geocoding)
tests/
  unit/                   Pure function tests
  integration/            API wrapper tests (mocked fetch)
  e2e/                    Playwright browser tests
  fixtures/               Mock Nominatim + Overpass responses
vitest.config.js
playwright.config.js
```

## Data sources

| Source | Used for |
|---|---|
| [Nominatim](https://nominatim.openstreetmap.org) | Place geocoding and autocomplete |
| [Overpass API](https://overpass-api.de) | Trail, hut, and water data |
| [OpenTopoMap](https://opentopomap.org) | Basemap tiles |
| [Leaflet](https://leafletjs.com) | Map rendering |

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

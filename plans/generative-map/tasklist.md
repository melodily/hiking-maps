# Tasklist: map-generator.html

## 1. HTML skeleton
- [ ] `<head>`: charset, viewport, title, Google Fonts links, Leaflet CSS+JS
- [ ] `<header>`: `#map-title`, `#place-search-wrapper` (input + Go button), `#hut-search-wrapper`
- [ ] `#cap-banner` div (hidden by default, below header)
- [ ] `#map-container`: `#map`, `#loading`, `#legend`, `#controls`, `#stats`

## 2. CSS
- [ ] Copy base variables and reset from `julian-alps-map.html` (`:root`, `*`, `body`, `header`, `#map-container`, `#map`)
- [ ] Legend styles (copy: `#legend`, `#legend-header`, `#legend-body`, `.legend-row`, `.legend-swatch`, `.legend-label`, `.legend-divider`, icons)
- [ ] Loading overlay styles (copy: `#loading`, `.loader-ring`, `@keyframes spin`, `#status`)
- [ ] Controls styles (copy: `#controls`, `.ctrl-btn`)
- [ ] Stats bar styles (copy: `#stats`)
- [ ] Popup styles (copy: `.leaflet-popup-*`, `.popup-name`, `.popup-tag`, `.popup-detail`)
- [ ] Hut search styles (copy: `#hut-search-wrapper`, `#hut-search`, `#hut-suggestions`, `.suggestion-item`, etc.)
- [ ] Locate pulse styles (copy: `.locate-pulse`, `.locate-ring`, `@keyframes pulse`)
- [ ] **New**: `#place-search-wrapper`, `#place-input`, `#btn-go`
- [ ] **New**: `#cap-banner`
- [ ] **New**: `.legend-row.sac-only` (visible by default) and `.legend-row.fallback-only` (hidden by default)

## 3. Map + tile layer
- [ ] Initialise Leaflet map at world zoom 2 (`center: [20, 0], zoom: 2`)
- [ ] Add OpenTopoMap tile layer

## 4. Difficulty config
- [x] Copy `DIFFICULTY` lookup table and `getDifficulty(sacScale)`

## 5. Layer groups + state
- [x] Declare `trailLayers`, `hutLayer`, `waterLayer`
- [x] Declare `layerVisible` and `difficultyVisible` state objects

## 6. Data arrays
- [x] Declare `hutData`, `trailData`, `waterData` arrays

## 7. Icons
- [x] Copy `hutIcon()`, `springIcon()`, `drinkingWaterIcon()`

## 8. Geocoding + bbox helpers
- [x] `geocode(query)` — GET Nominatim search, return `{ lat, lon, bbox, displayName }`
- [x] `capBbox(bbox, centerLat, centerLon)` — clamp each axis to MAX_SIDE_KM=50, return `{ bbox, capped }`

## 9. Overpass query builders
- [x] `buildSacQuery(bbox)` — SAC trails + huts + water
- [x] `buildFallbackQuery(bbox)` — generic `highway~path|footway|track` + huts + water
- [x] `fetchOverpass(query)` — POST to Overpass API, return parsed JSON

## 10. clearMapData()
- [x] Remove all layers from map (`hutLayer`, `waterLayer`, each entry in `trailLayers`)
- [x] Clear `hutData`, `trailData`, `waterData` arrays
- [x] Reset `trailLayers` object
- [x] Hide stats bar and disable GPX button

## 11. Marker helpers
- [x] Copy `addHutMarker(tags, lat, lon)` — pushes to `hutLayer` and `hutData`
- [x] Copy `addWaterMarker(tags, lat, lon)` — pushes to `waterLayer` and `waterData`

## 12. renderData(data, fallback)
- [x] Copy way/node dispatch loop from `julian-alps-map.html`
- [x] In fallback mode: use a single blue colour for all trails instead of SAC colours
- [x] Add trail polylines to `trailLayers` keyed by difficulty (or `'generic'` in fallback)
- [x] Update stats bar

## 13. setFallbackLegend(on)
- [x] Toggle `.sac-only` rows hidden/visible
- [x] Toggle `.fallback-only` row visible/hidden
- [x] Update legend title text

## 14. Toggle helpers
- [x] Copy `toggleLegend()`
- [x] Copy `toggleLayer(which, btn)`
- [x] Copy `toggleDifficulty(key, row)`

## 15. Hut search
- [x] Copy hut search IIFE (`norm`, `openHut`, `renderSuggestions`, `closeDropdown`, `setFocus`, event listeners)

## 16. GPX export
- [x] Copy `downloadGPX()`, make filename dynamic: `placeName.replace(/\s+/g,'-').toLowerCase() + '.gpx'`

## 17. Locate me
- [x] Copy `toggleLocate(btn)` with watcher, pulse marker, accuracy circle

## 18. doSearch(query)
- [x] Show spinner, set loading message
- [x] Call `geocode(query)`; on failure show error in status, stop spinner
- [x] Call `capBbox`; show/hide `#cap-banner`
- [x] Call `clearMapData()`
- [x] Fetch SAC query; if 0 trails → fetch fallback query
- [x] Call `setFallbackLegend(fallback)`
- [x] Call `renderData(data, fallback)`
- [x] Fit map to bbox
- [x] Update `#map-title` to `displayName`
- [x] Push `?q=` to URL without page reload
- [x] Enable GPX button; hide spinner

## 19. Place search UI wiring
- [x] `#btn-go` click → `doSearch(input.value.trim())`
- [x] `#place-input` keydown Enter → same
- [x] On load: read `?q=` from URL; if present, pre-fill input and call `doSearch`

## 20. Initial loading overlay state
- [x] Hide spinner ring on initial load
- [x] Set message to "Enter a place name above to generate a hiking map"
- [x] Keep overlay visible until first search completes

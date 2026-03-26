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
- [ ] Copy `DIFFICULTY` lookup table and `getDifficulty(sacScale)`

## 5. Layer groups + state
- [ ] Declare `trailLayers`, `hutLayer`, `waterLayer`
- [ ] Declare `layerVisible` and `difficultyVisible` state objects

## 6. Data arrays
- [ ] Declare `hutData`, `trailData`, `waterData` arrays

## 7. Icons
- [ ] Copy `hutIcon()`, `springIcon()`, `drinkingWaterIcon()`

## 8. Geocoding + bbox helpers
- [ ] `geocode(query)` — GET Nominatim search, return `{ lat, lon, bbox, displayName }`
- [ ] `capBbox(bbox, centerLat, centerLon)` — clamp each axis to MAX_SIDE_KM=50, return `{ bbox, capped }`

## 9. Overpass query builders
- [ ] `buildSacQuery(bbox)` — SAC trails + huts + water
- [ ] `buildFallbackQuery(bbox)` — generic `highway~path|footway|track` + huts + water
- [ ] `fetchOverpass(query)` — POST to Overpass API, return parsed JSON

## 10. clearMapData()
- [ ] Remove all layers from map (`hutLayer`, `waterLayer`, each entry in `trailLayers`)
- [ ] Clear `hutData`, `trailData`, `waterData` arrays
- [ ] Reset `trailLayers` object
- [ ] Hide stats bar and disable GPX button

## 11. Marker helpers
- [ ] Copy `addHutMarker(tags, lat, lon)` — pushes to `hutLayer` and `hutData`
- [ ] Copy `addWaterMarker(tags, lat, lon)` — pushes to `waterLayer` and `waterData`

## 12. renderData(data, fallback)
- [ ] Copy way/node dispatch loop from `julian-alps-map.html`
- [ ] In fallback mode: use a single blue colour for all trails instead of SAC colours
- [ ] Add trail polylines to `trailLayers` keyed by difficulty (or `'generic'` in fallback)
- [ ] Update stats bar

## 13. setFallbackLegend(on)
- [ ] Toggle `.sac-only` rows hidden/visible
- [ ] Toggle `.fallback-only` row visible/hidden
- [ ] Update legend title text

## 14. Toggle helpers
- [ ] Copy `toggleLegend()`
- [ ] Copy `toggleLayer(which, btn)`
- [ ] Copy `toggleDifficulty(key, row)`

## 15. Hut search
- [ ] Copy hut search IIFE (`norm`, `openHut`, `renderSuggestions`, `closeDropdown`, `setFocus`, event listeners)

## 16. GPX export
- [ ] Copy `downloadGPX()`, make filename dynamic: `placeName.replace(/\s+/g,'-').toLowerCase() + '.gpx'`

## 17. Locate me
- [ ] Copy `toggleLocate(btn)` with watcher, pulse marker, accuracy circle

## 18. doSearch(query)
- [ ] Show spinner, set loading message
- [ ] Call `geocode(query)`; on failure show error in status, stop spinner
- [ ] Call `capBbox`; show/hide `#cap-banner`
- [ ] Call `clearMapData()`
- [ ] Fetch SAC query; if 0 trails → fetch fallback query
- [ ] Call `setFallbackLegend(fallback)`
- [ ] Call `renderData(data, fallback)`
- [ ] Fit map to bbox
- [ ] Update `#map-title` to `displayName`
- [ ] Push `?q=` to URL without page reload
- [ ] Enable GPX button; hide spinner

## 19. Place search UI wiring
- [ ] `#btn-go` click → `doSearch(input.value.trim())`
- [ ] `#place-input` keydown Enter → same
- [ ] On load: read `?q=` from URL; if present, pre-fill input and call `doSearch`

## 20. Initial loading overlay state
- [ ] Hide spinner ring on initial load
- [ ] Set message to "Enter a place name above to generate a hiking map"
- [ ] Keep overlay visible until first search completes

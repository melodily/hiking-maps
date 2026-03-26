# Plan: map-generator.html

## Goal
A single-file HTML page where the user types any place name (e.g. "Tatras mountains, Slovakia"), hits Go, and gets an interactive hiking map of that area — same visual style as `julian-alps-map.html`.

## Architecture

### Geocoding
- Use **Nominatim** (`https://nominatim.openstreetmap.org/search`) to convert the place name into a bounding box.
- Parse `boundingbox` from the first result → `[minLat, maxLat, minLon, maxLon]`.

### Bounding-box capping
- If either dimension of the bbox exceeds **50 km**, cap it to 50×50 km centered on the result centroid.
- Show a thin yellow **cap banner** below the header when capping occurs.

### Overpass queries
- **SAC-first**: query `way["highway"]["sac_scale"]` + huts + water within bbox.
- **Fallback**: if zero trails returned, re-query with `way["highway"~"^(path|footway|track)$"]` — draw all lines in a single blue color.
- Fallback mode swaps the legend: hide T1–T6 rows, show a single "Hiking path" row.

### Map state
- Initial view: world zoom level 2, no data loaded.
- Loading overlay on first paint reads: *"Enter a place to generate a hiking map"* (no spinner yet).
- On search: spinner + status text appear while fetching.

### URL params
- `?q=Tatras+mountains` pre-fills the search box and runs the search on load, enabling shareable links.

---

## Key Differences from `julian-alps-map.html`

| Concern | julian-alps | map-generator |
|---|---|---|
| Title | Hardcoded "Julian Alps" | Dynamic — set after geocoding |
| BBOX | Hardcoded constant | Computed from Nominatim at search time |
| Overpass query | Single static query | `buildSacQuery(bbox)` / `buildFallbackQuery(bbox)` |
| Fallback mode | N/A | Re-queries if 0 SAC trails; generic legend |
| Initial map state | Zoomed to Alps | World view zoom 2 |
| Loading message | "Fetching trail data…" | "Enter a place…" → changes on search |
| Cap banner | N/A | Yellow bar when bbox was capped |
| GPX filename | `julian-alps.gpx` | `<place-name>.gpx` |
| Data arrays | Module-level constants | Cleared between searches (`clearMapData()`) |

---

## New Functions

- **`doSearch(query)`** — orchestrates: geocode → capBbox → fetch SAC → fallback → renderData → update title/URL
- **`geocode(query)`** — calls Nominatim, returns `{ lat, lon, bbox, displayName }`
- **`capBbox(bbox, centerLat, centerLon)`** — clamps bbox to MAX_SIDE_KM=50, returns `{ bbox, capped }`
- **`buildSacQuery(bbox)`** — returns Overpass QL string for SAC trails + huts + water
- **`buildFallbackQuery(bbox)`** — returns Overpass QL string for generic paths + huts + water
- **`clearMapData()`** — removes all layers/markers and resets data arrays between searches
- **`setFallbackLegend(on)`** — toggles between SAC legend rows and generic "Hiking path" row

---

## HTML Structure

```
<head> fonts + Leaflet CSS + <style> </head>
<body>
  <header>
    <h1 id="map-title">Hiking Map Generator</h1>
    <div id="place-search-wrapper">
      <input id="place-input" placeholder="Enter a place…">
      <button id="btn-go">Go</button>
    </div>
    <div id="hut-search-wrapper"> … </div>
  </header>

  <div id="cap-banner" hidden>Area capped to 50 × 50 km around centre</div>

  <div id="map-container">
    <div id="map"></div>
    <div id="loading"> … </div>   <!-- initial: no spinner, prompt text -->
    <div id="legend"> … </div>
    <div id="controls"> … </div>
    <div id="stats"></div>
  </div>

  <script> … </script>
</body>
```

---

## CSS Additions
- `#place-search-wrapper` — flex row, styled like hut-search but wider
- `#btn-go` — same `.ctrl-btn` style, inline with input
- `#cap-banner` — full-width bar, `background: #b8960022`, `color: #f0c040`, `font-size: 0.75rem`, `padding: 5px 24px`
- `.legend-row.fallback-only` — hidden by default; shown in fallback mode
- `.legend-row.sac-only` — visible by default; hidden in fallback mode

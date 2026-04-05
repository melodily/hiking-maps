# Task: Map Generator Page

## Context
Create a single-file HTML page (`map-generator.html`) where a user enters a place name (e.g. "Tatras mountains, Slovakia") via a search box, and the page generates an interactive hiking map of that area. Based on the existing `julian-alps-map.html` architecture — Leaflet + OpenTopoMap tiles + Overpass API for trail/hut/water data + GPX export.

## Branch
`claude/generative-map-GVPRk` (branched from `master`)

## Design Decisions (confirmed by user)
1. **Single file** — self-contained HTML like the existing maps
2. **Nominatim geocoding** — converts place name → bounding box
3. **Bbox capping** — if area exceeds ~50×50 km, cap around center and show a notice
4. **SAC-first with fallback** — query SAC-scale trails first; if zero results, re-query for generic `highway=path/footway/track`
5. **URL params** — `?q=Tatras+mountains` for shareable links
6. **Same UI** — legend, layer toggles, hut search, GPX export, locate me

## Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Read and understand `julian-alps-map.html` source | DONE |
| 2 | Design the architecture and get user confirmation | DONE |
| 3 | Write `map-generator.html` | NOT STARTED |
| 4 | Commit and push to branch | NOT STARTED |

## Key Differences from julian-alps-map.html
- **Header**: place search input + Go button instead of hardcoded title; dynamic title after search
- **No hardcoded BBOX/QUERY**: computed at search time from Nominatim result
- **`doSearch(query)` flow**: geocode → cap bbox → fetch SAC → fallback if needed → render
- **`clearMapData()`**: resets layers/data between searches
- **`capBbox(result)`**: caps bbox to MAX_SIDE_KM (50 km) around center if too large
- **`buildSacQuery(bbox)` / `buildFallbackQuery(bbox)`**: dynamic Overpass query builders
- **Fallback legend**: hides SAC T1-T6 rows, shows generic "Hiking path" row with blue swatch
- **GPX filename**: dynamic based on place name
- **Initial map state**: world view at zoom 2, loading overlay says "Enter a place to generate a hiking map"
- **Cap banner**: thin yellow bar below header when bbox was capped

## File Structure (planned)
```
CSS:   Same variables/styles as julian-alps + place search + cap banner + fallback legend
HTML:  header(title + place-search + hut-search) → cap-banner → map-container(map + loading + legend + controls + stats)
JS:    Map setup → Difficulty config → Layer groups → Icons → Geocoding/capBbox →
       Overpass query builders → clearMapData → Marker helpers → renderData(data, fallback) →
       Toggle helpers → Hut search → GPX export → Locate me → doSearch() → URL init
```

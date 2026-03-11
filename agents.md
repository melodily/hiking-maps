# Hiking Maps — Project Overview

## Intent

A collection of single-file, self-contained HTML hiking maps that run entirely in the browser with no backend. Each map fetches live trail and POI data from OpenStreetMap via the Overpass API and renders it on an interactive Leaflet.js map. The maps are designed to be opened on a phone in the field, with GPS tracking and offline GPX export for use in navigation apps.

Current maps:
- **`julian-alps-map.html`** — Julian Alps, Slovenia (SAC-scale trail difficulty)
- **`milford-track-map.html`** — Milford Track, Fiordland, New Zealand

---

## Major Functions

### Data fetching

| Function / Section | Description |
|--------------------|-------------|
| `QUERY` / Overpass fetch | Builds and sends an Overpass QL query for the map's bounding box. Fetches hiking trails (`highway` + `sac_scale`), alpine huts/shelters (`tourism=alpine_hut/wilderness_hut/shelter`) as both nodes and ways, natural springs (`natural=spring`), and drinking water points (`amenity=drinking_water`). |
| `renderData(data)` | Processes the raw Overpass JSON response. Dispatches each element to the appropriate handler: way-based trails become coloured polylines, way-based huts have their centroid computed, nodes are routed to `addHutMarker` or `addWaterMarker`. Populates `trailData`, `hutData`, and `waterData` arrays and updates the stats bar. |

### Icons

| Function | Description |
|----------|-------------|
| `hutIcon()` | Returns a dark-blue house-shaped SVG `L.divIcon` for mountain huts and shelters. |
| `springIcon()` | Returns a blue teardrop SVG `L.divIcon` anchored at its tip for natural springs. |
| `drinkingWaterIcon()` | Returns a teal cup SVG `L.divIcon` for drinking water points. |

### Marker helpers

| Function | Description |
|----------|-------------|
| `addHutMarker(tags, lat, lon)` | Creates a hut marker, binds a popup with name, elevation, operator, opening months, and booking link, and registers the hut in `hutData` for search. |
| `addWaterMarker(tags, lat, lon)` | Creates a spring or drinking water marker, binds a popup with name, type, and elevation, and registers it in `waterData` for GPX export. |

### Difficulty

| Function | Description |
|----------|-------------|
| `getDifficulty(sacScale)` | Maps an OSM `sac_scale` tag value to a display label and hex colour (T1 green → T6 dark red). Returns a grey "Unknown" entry for unmapped values. |

### UI controls

| Function | Description |
|----------|-------------|
| `toggleLegend()` | Collapses or expands the difficulty legend using a CSS `max-height` transition. |
| `toggleLayer(which, btn)` | Shows or hides the Trails, Huts, or Water layer group and toggles the button's active state. |
| `toggleDifficulty(key, row)` | Shows or hides all polylines of a specific SAC difficulty level from the legend. |

### Search

| IIFE section | Description |
|--------------|-------------|
| Hut search | Listens to the `#hut-search` input. Filters `hutData` using accent-insensitive, substring matching via Unicode NFD normalisation. Renders a dropdown of matches with keyboard navigation (↑ ↓ Enter Escape). |
| `norm(s)` | Strips combining diacritical marks and lowercases a string for accent-insensitive comparison. |
| `openHut(hut)` | Flies the map to the hut at zoom 15 and opens its popup after a short delay. |

### GPX export

| Function | Description |
|----------|-------------|
| `downloadGPX()` | Builds a GPX 1.1 file from the loaded data and triggers a browser download. Waypoints include `<sym>` tags and OsmAnd icon/colour extensions. Tracks include Garmin `gpxx:DisplayColor` (named colour) and OsmAnd `osmand:color` (hex) extensions so trail difficulty colours are preserved in Garmin BaseCamp and OsmAnd. The button is disabled until data has fully loaded. |

### GPS / locate

| Function | Description |
|----------|-------------|
| `toggleLocate(btn)` | Starts or stops `navigator.geolocation.watchPosition`. While active, renders a pulsing blue dot at the device's position plus a translucent accuracy circle. Button cycles through "Locate me" → "Locating…" → "Tracking" states. |

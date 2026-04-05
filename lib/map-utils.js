// ── Difficulty config ──────────────────────────────────────────────────────
export const DIFFICULTY = {
  hiking:                    { key:'T1', label:'T1 – Hiking',             color:'#1a7a3a', width:2.5 },
  mountain_hiking:           { key:'T2', label:'T2 – Mountain Hiking',    color:'#5a9400', width:2.5 },
  demanding_mountain_hiking: { key:'T3', label:'T3 – Demanding Mountain', color:'#f39c12', width:3   },
  alpine_hiking:             { key:'T4', label:'T4 – Alpine Hiking',      color:'#e67e22', width:3   },
  demanding_alpine_hiking:   { key:'T5', label:'T5 – Demanding Alpine',   color:'#e74c3c', width:3.5 },
  difficult_alpine_hiking:   { key:'T6', label:'T6 – Difficult Alpine',   color:'#8e1a1a', width:4   },
};

export function getDifficulty(sacScale) {
  return DIFFICULTY[sacScale] || { key:'unknown', label:'Unknown', color:'#999999', width:2 };
}

// ── Bbox cap ───────────────────────────────────────────────────────────────
export const MAX_SIDE_KM = 50;

/** Clamp a "S,W,N,E" bbox string to MAX_SIDE_KM on each axis. */
export function capBbox(bbox, centerLat, centerLon) {
  const KM_PER_DEG_LAT = 111.0;
  const kmPerDegLon = KM_PER_DEG_LAT * Math.cos(centerLat * Math.PI / 180);
  const maxDegLat = (MAX_SIDE_KM / 2) / KM_PER_DEG_LAT;
  const maxDegLon = (MAX_SIDE_KM / 2) / kmPerDegLon;

  let [s, w, n, e] = bbox.split(',').map(Number);
  let capped = false;

  if (n - s > maxDegLat * 2) { s = centerLat - maxDegLat; n = centerLat + maxDegLat; capped = true; }
  if (e - w > maxDegLon * 2) { w = centerLon - maxDegLon; e = centerLon + maxDegLon; capped = true; }

  return { bbox: `${s.toFixed(5)},${w.toFixed(5)},${n.toFixed(5)},${e.toFixed(5)}`, capped };
}

// ── Overpass query builders ────────────────────────────────────────────────
export function buildSacQuery(bbox) {
  return `
[out:json][timeout:90][bbox:${bbox}];
(
  way["highway"]["sac_scale"];
  way["highway"="path"]["mountain_hiking"];
  node["tourism"="alpine_hut"];
  node["tourism"="wilderness_hut"];
  node["tourism"="shelter"];
  way["tourism"="alpine_hut"];
  way["tourism"="wilderness_hut"];
  way["tourism"="shelter"];
  node["natural"="spring"];
  node["amenity"="drinking_water"];
);
out geom tags;
`.trim();
}

export function buildFallbackQuery(bbox) {
  return `
[out:json][timeout:90][bbox:${bbox}];
(
  way["highway"~"^(path|footway|track)$"];
  node["tourism"="alpine_hut"];
  node["tourism"="wilderness_hut"];
  node["tourism"="shelter"];
  way["tourism"="alpine_hut"];
  way["tourism"="wilderness_hut"];
  way["tourism"="shelter"];
  node["natural"="spring"];
  node["amenity"="drinking_water"];
);
out geom tags;
`.trim();
}

// ── Nominatim geocoder ─────────────────────────────────────────────────────
export async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!resp.ok) throw new Error(`Nominatim HTTP ${resp.status}`);
  const results = await resp.json();
  if (!results.length) throw new Error(`No results for "${query}"`);
  const r = results[0];
  const bb = r.boundingbox; // [minLat, maxLat, minLon, maxLon]
  return {
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    bbox: `${bb[0]},${bb[2]},${bb[1]},${bb[3]}`, // S,W,N,E for Overpass
    displayName: r.display_name.split(',').slice(0, 2).join(', ')
  };
}

/** Fetch up to `limit` Nominatim suggestions for the given query string. */
export async function geocodeSuggest(query, limit = 5) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&q=${encodeURIComponent(query)}`;
  const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!resp.ok) return [];
  const results = await resp.json();
  return results.map(r => {
    const parts = r.display_name.split(',');
    return {
      name: parts[0].trim(),
      meta: parts.slice(1, 3).map(s => s.trim()).filter(Boolean).join(', '),
      type: r.type,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    };
  });
}

// ── Overpass fetch ─────────────────────────────────────────────────────────
export async function fetchOverpass(query) {
  const url = 'https://overpass-api.de/api/interpreter';
  const resp = await fetch(url, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query)
  });
  if (!resp.ok) throw new Error(`Overpass HTTP ${resp.status}`);
  return resp.json();
}

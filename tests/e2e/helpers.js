import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const nominatimFixture = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/nominatim-triglav.json'), 'utf8')
);
export const overpassSacFixture = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/overpass-sac.json'), 'utf8')
);
export const overpassFallbackFixture = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/overpass-fallback.json'), 'utf8')
);

/** Stub Nominatim + Overpass with the standard SAC fixtures. */
export async function stubNetworkSac(page) {
  await page.route('**/nominatim.openstreetmap.org/**', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(nominatimFixture) })
  );
  await page.route('**/overpass-api.de/**', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(overpassSacFixture) })
  );
}

/** Stub Nominatim to return no results. */
export async function stubNominatimEmpty(page) {
  await page.route('**/nominatim.openstreetmap.org/**', route =>
    route.fulfill({ contentType: 'application/json', body: '[]' })
  );
}

/** Stub Overpass with fallback (no sac_scale) fixture. */
export async function stubNetworkFallback(page) {
  await page.route('**/nominatim.openstreetmap.org/**', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(nominatimFixture) })
  );
  // First Overpass call (SAC) returns 0 trails; second (fallback) returns data
  let overpassCallCount = 0;
  await page.route('**/overpass-api.de/**', route => {
    overpassCallCount++;
    const body = overpassCallCount === 1
      ? JSON.stringify({ version: 0.6, elements: [] })
      : JSON.stringify(overpassFallbackFixture);
    route.fulfill({ contentType: 'application/json', body });
  });
}

/** Stub Nominatim to return a very large bounding box (triggers cap). */
export async function stubNominatimLargeBbox(page) {
  const large = JSON.parse(JSON.stringify(nominatimFixture));
  large[0].boundingbox = ['40.0', '50.0', '8.0', '18.0'];
  await page.route('**/nominatim.openstreetmap.org/**', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(large) })
  );
  await page.route('**/overpass-api.de/**', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(overpassSacFixture) })
  );
}

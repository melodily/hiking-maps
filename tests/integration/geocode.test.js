import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { geocode } from '../../lib/map-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const nominatimFixture = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/nominatim-triglav.json'), 'utf8')
);

afterEach(() => vi.restoreAllMocks());

function mockFetch(body, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }));
}

describe('geocode', () => {
  it('resolves with lat, lon, bbox (S,W,N,E) and displayName on success', async () => {
    mockFetch(nominatimFixture);
    const result = await geocode('Triglav');

    expect(result.lat).toBeCloseTo(46.3793, 3);
    expect(result.lon).toBeCloseTo(13.8369, 3);
    // bbox should be "S,W,N,E" format
    const [s, w, n, e] = result.bbox.split(',').map(Number);
    expect(s).toBeLessThan(n);
    expect(w).toBeLessThan(e);
    expect(result.displayName).toContain('Triglav');
  });

  it('displayName takes only the first two comma-separated parts', async () => {
    mockFetch(nominatimFixture);
    const result = await geocode('Triglav');
    const parts = result.displayName.split(', ');
    expect(parts.length).toBeLessThanOrEqual(2);
  });

  it('throws "No results" when Nominatim returns an empty array', async () => {
    mockFetch([]);
    await expect(geocode('xyzzy')).rejects.toThrow('No results for "xyzzy"');
  });

  it('throws with HTTP status when Nominatim responds with an error code', async () => {
    mockFetch(null, 500);
    await expect(geocode('Triglav')).rejects.toThrow('Nominatim HTTP 500');
  });

  it('sends Accept-Language: en header', async () => {
    mockFetch(nominatimFixture);
    await geocode('Triglav');
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options.headers['Accept-Language']).toBe('en');
  });

  it('encodes special characters in the query', async () => {
    mockFetch(nominatimFixture);
    await geocode('Triglav & Bohinj');
    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain(encodeURIComponent('Triglav & Bohinj'));
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { fetchOverpass } from '../../lib/map-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sacFixture = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/overpass-sac.json'), 'utf8')
);

afterEach(() => vi.restoreAllMocks());

function mockFetch(body, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }));
}

describe('fetchOverpass', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch(sacFixture);
    const result = await fetchOverpass('[out:json];node;out;');
    expect(result.elements).toHaveLength(sacFixture.elements.length);
  });

  it('POSTs to the Overpass interpreter endpoint', async () => {
    mockFetch(sacFixture);
    await fetchOverpass('test query');
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain('overpass-api.de');
    expect(options.method).toBe('POST');
  });

  it('sends the query as URL-encoded body', async () => {
    mockFetch(sacFixture);
    const query = '[out:json];node;out;';
    await fetchOverpass(query);
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options.body).toBe('data=' + encodeURIComponent(query));
  });

  it('throws with HTTP status on error response', async () => {
    mockFetch(null, 429);
    await expect(fetchOverpass('query')).rejects.toThrow('Overpass HTTP 429');
  });

  it('throws on server error (HTTP 504)', async () => {
    mockFetch(null, 504);
    await expect(fetchOverpass('query')).rejects.toThrow('Overpass HTTP 504');
  });
});

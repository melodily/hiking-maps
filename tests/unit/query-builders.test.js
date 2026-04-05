import { describe, it, expect } from 'vitest';
import { buildSacQuery, buildFallbackQuery } from '../../lib/map-utils.js';

const BBOX = '46.0,13.3,46.85,14.25';

describe('buildSacQuery', () => {
  it('contains the supplied bbox', () => {
    expect(buildSacQuery(BBOX)).toContain(BBOX);
  });

  it('requests SAC-scale ways', () => {
    expect(buildSacQuery(BBOX)).toContain('sac_scale');
  });

  it('requests alpine_hut nodes', () => {
    expect(buildSacQuery(BBOX)).toContain('"tourism"="alpine_hut"');
  });

  it('requests natural springs', () => {
    expect(buildSacQuery(BBOX)).toContain('"natural"="spring"');
  });

  it('requests drinking water', () => {
    expect(buildSacQuery(BBOX)).toContain('"amenity"="drinking_water"');
  });

  it('does NOT use generic highway filter', () => {
    expect(buildSacQuery(BBOX)).not.toContain('"highway"~');
  });

  it('outputs JSON format', () => {
    expect(buildSacQuery(BBOX)).toContain('[out:json]');
  });

  it('returns a trimmed string (no leading/trailing whitespace)', () => {
    const q = buildSacQuery(BBOX);
    expect(q).toBe(q.trim());
  });
});

describe('buildFallbackQuery', () => {
  it('contains the supplied bbox', () => {
    expect(buildFallbackQuery(BBOX)).toContain(BBOX);
  });

  it('uses a generic highway regex for path/footway/track', () => {
    expect(buildFallbackQuery(BBOX)).toContain('"highway"~');
    expect(buildFallbackQuery(BBOX)).toContain('path');
    expect(buildFallbackQuery(BBOX)).toContain('footway');
    expect(buildFallbackQuery(BBOX)).toContain('track');
  });

  it('does NOT request sac_scale', () => {
    expect(buildFallbackQuery(BBOX)).not.toContain('sac_scale');
  });

  it('still requests alpine huts', () => {
    expect(buildFallbackQuery(BBOX)).toContain('"tourism"="alpine_hut"');
  });

  it('still requests drinking water', () => {
    expect(buildFallbackQuery(BBOX)).toContain('"amenity"="drinking_water"');
  });

  it('returns a trimmed string', () => {
    const q = buildFallbackQuery(BBOX);
    expect(q).toBe(q.trim());
  });
});

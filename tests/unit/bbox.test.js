import { describe, it, expect } from 'vitest';
import { capBbox, MAX_SIDE_KM } from '../../lib/map-utils.js';

// Convenience: build a bbox string from explicit S,W,N,E degrees
const bbox = (s, w, n, e) => `${s},${w},${n},${e}`;

describe('capBbox', () => {
  it('does not cap a small area well within 50 km', () => {
    // ~2 km × 2 km square around Triglav
    const input = bbox(46.370, 13.820, 46.388, 13.838);
    const { bbox: out, capped } = capBbox(input, 46.379, 13.829);
    expect(capped).toBe(false);
    // Output should closely match input (within floating-point round-trip)
    const [s, w, n, e] = out.split(',').map(Number);
    expect(n - s).toBeCloseTo(0.018, 3);
    expect(e - w).toBeCloseTo(0.018, 3);
  });

  it('caps a too-wide bbox on the longitude axis', () => {
    // 10° of longitude ≈ 700+ km at mid-latitudes
    const input = bbox(46.370, 8.0, 46.388, 18.0);
    const { bbox: out, capped } = capBbox(input, 46.379, 13.0);
    expect(capped).toBe(true);
    const [, w, , e] = out.split(',').map(Number);
    const widthKm = (e - w) * 111.0 * Math.cos(46.379 * Math.PI / 180);
    expect(widthKm).toBeCloseTo(MAX_SIDE_KM, 0);
  });

  it('caps a too-tall bbox on the latitude axis', () => {
    // 10° of latitude ≈ 1110 km
    const input = bbox(40.0, 13.820, 50.0, 13.838);
    const { bbox: out, capped } = capBbox(input, 46.379, 13.829);
    expect(capped).toBe(true);
    const [s, , n] = out.split(',').map(Number);
    const heightKm = (n - s) * 111.0;
    expect(heightKm).toBeCloseTo(MAX_SIDE_KM, 0);
  });

  it('caps both axes when both are oversized', () => {
    const input = bbox(40.0, 8.0, 50.0, 18.0);
    const { bbox: out, capped } = capBbox(input, 46.0, 13.0);
    expect(capped).toBe(true);
    const [s, w, n, e] = out.split(',').map(Number);
    const heightKm = (n - s) * 111.0;
    const widthKm  = (e - w) * 111.0 * Math.cos(46.0 * Math.PI / 180);
    expect(heightKm).toBeCloseTo(MAX_SIDE_KM, 0);
    expect(widthKm).toBeCloseTo(MAX_SIDE_KM, 0);
  });

  it('centre is preserved when capping', () => {
    const input = bbox(40.0, 8.0, 50.0, 18.0);
    const { bbox: out } = capBbox(input, 45.0, 13.0);
    const [s, w, n, e] = out.split(',').map(Number);
    expect((s + n) / 2).toBeCloseTo(45.0, 3);
    expect((w + e) / 2).toBeCloseTo(13.0, 3);
  });

  it('applies cos-projection for longitude at high latitude (narrower cap)', () => {
    const inputLow  = bbox(10.0, 8.0, 20.0, 18.0);
    const inputHigh = bbox(70.0, 8.0, 80.0, 18.0);
    const { bbox: outLow  } = capBbox(inputLow,  15.0, 13.0);
    const { bbox: outHigh } = capBbox(inputHigh, 75.0, 13.0);
    const [, wL, , eL] = outLow.split(',').map(Number);
    const [, wH, , eH] = outHigh.split(',').map(Number);
    // Higher latitude → wider degree-span for the same km cap
    expect(eH - wH).toBeGreaterThan(eL - wL);
  });
});

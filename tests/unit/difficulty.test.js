import { describe, it, expect } from 'vitest';
import { DIFFICULTY, getDifficulty } from '../../lib/map-utils.js';

describe('getDifficulty', () => {
  it.each([
    ['hiking',                    'T1', '#1a7a3a', 2.5],
    ['mountain_hiking',           'T2', '#5a9400', 2.5],
    ['demanding_mountain_hiking', 'T3', '#f39c12', 3  ],
    ['alpine_hiking',             'T4', '#e67e22', 3  ],
    ['demanding_alpine_hiking',   'T5', '#e74c3c', 3.5],
    ['difficult_alpine_hiking',   'T6', '#8e1a1a', 4  ],
  ])('"%s" → key %s, colour %s, width %d', (sacScale, key, color, width) => {
    const d = getDifficulty(sacScale);
    expect(d.key).toBe(key);
    expect(d.color).toBe(color);
    expect(d.width).toBe(width);
  });

  it('returns grey fallback for an unknown sac_scale value', () => {
    const d = getDifficulty('scrambling');
    expect(d.key).toBe('unknown');
    expect(d.color).toBe('#999999');
    expect(d.width).toBe(2);
  });

  it('returns grey fallback for undefined', () => {
    expect(getDifficulty(undefined).key).toBe('unknown');
  });

  it('returns grey fallback for empty string', () => {
    expect(getDifficulty('').key).toBe('unknown');
  });

  it('DIFFICULTY has exactly 6 entries', () => {
    expect(Object.keys(DIFFICULTY)).toHaveLength(6);
  });
});

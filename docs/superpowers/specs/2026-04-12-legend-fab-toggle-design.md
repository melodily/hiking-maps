# Legend FAB Toggle — Design Spec

**Date:** 2026-04-12  
**File in scope:** `map-generator.html`  
**Problem:** The `#legend` panel sits at `bottom: 28px` and is occluded by mobile browser chrome (iOS Safari nav bar, Android Chrome tab bar). Even when collapsed, the header can be fully hidden so there is no visible affordance to open the legend.

---

## Chosen Approach: Floating Action Button (FAB)

Replace the always-visible collapsed legend header with a dedicated FAB that is always above mobile browser chrome. The legend panel opens above the FAB when tapped.

---

## Components

### 1. Legend FAB (`#legend-fab`)

- **Position:** `position: absolute; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); left: 16px; z-index: 900`
- **Size:** 38×38px — matches the existing `#menu-btn` dimensions
- **Style:** Same `.ctrl-btn` glass style (`rgba(26,26,24,0.92)` background, `border: 1px solid rgba(255,255,255,0.1)`, `backdrop-filter: blur(8px)`, `border-radius: 6px`)
- **Icon:** Map-lines SVG (same visual weight as the hamburger in `#menu-btn`)
- **Active state:** Gets `.open` class when legend is visible (border brightens, matching `#menu-btn.open`)
- **Aria:** `aria-label="Toggle legend"`, `aria-expanded` toggled programmatically

### 2. Legend panel (`#legend`)

- **Default state:** Hidden — `opacity: 0; pointer-events: none; max-height: 0` — no collapsed header visible
- **Open state:** `.open` class applied — `opacity: 1; pointer-events: auto; max-height: 60vh`
- **Position:** `bottom: calc(62px + env(safe-area-inset-bottom, 0px)); left: 16px` — sits directly above the FAB with a 6px gap
- **Overflow:** `overflow-y: auto` so content never clips on short screens
- **Transition:** Existing `max-height 0.25s ease, opacity 0.2s ease` — no changes needed
- **Remove:** `#legend-header` click handler and the `▲` toggle arrow (`#legend-toggle`) — the FAB is the sole trigger now. The header `h3` title remains for visual labelling inside the open panel.

### 3. Toggle behavior

- **Open/close:** `toggleLegend()` updated — toggles `.open` on `#legend` and `#legend-fab`
- **Close on map tap:** `map.on('click', () => closeLegend())` — consistent with how `#menu-panel` is closed
- **`closeLegend()`:** Removes `.open` from both `#legend` and `#legend-fab`

---

## What Does NOT Change

- All `toggleDifficulty()` logic and legend row behavior
- The `.sac-only` / `.fallback-only` row switching
- `#menu-btn` / `#menu-panel` (top-right controls)
- `#btn-locate` (bottom-right)
- `#stats`, `#loading`, header, hut search
- `julian-alps-map.html` and `milford-track-map.html` — out of scope

---

## CSS Summary

```css
/* FAB */
#legend-fab {
  position: absolute;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  z-index: 900;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
#legend-fab.open {
  background: rgba(50,50,46,0.95);
  border-color: rgba(255,255,255,0.2);
}

/* Legend panel (replaces old absolute positioning) */
#legend {
  position: absolute;
  bottom: calc(62px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  /* ... existing glass styles ... */
  max-height: 0;
  opacity: 0;
  pointer-events: none;
  overflow-y: auto;
  transition: max-height 0.25s ease, opacity 0.2s ease;
}
#legend.open {
  max-height: 60vh;
  opacity: 1;
  pointer-events: auto;
}
```

---

## JS Summary

```js
function toggleLegend() {
  const panel = document.getElementById('legend');
  const fab = document.getElementById('legend-fab');
  const isOpen = panel.classList.toggle('open');
  fab.classList.toggle('open', isOpen);
  fab.setAttribute('aria-expanded', isOpen);
}

function closeLegend() {
  document.getElementById('legend').classList.remove('open');
  const fab = document.getElementById('legend-fab');
  fab.classList.remove('open');
  fab.setAttribute('aria-expanded', 'false');
}

map.on('click', closeLegend);
```

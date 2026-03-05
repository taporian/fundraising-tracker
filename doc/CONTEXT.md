<!--
  HOW TO MAINTAIN THIS DOCUMENT
  ==============================
  This file is the canonical AI context document for this codebase.
  It is NOT written for human reading — it is written to give an AI assistant
  (Claude or similar) complete, unambiguous understanding of the project so it
  can make correct changes without needing to re-read every source file.

  Rules for updating this document:
  - Update it any time a file is added, removed, renamed, or its purpose changes.
  - Update it any time a bug is fixed — record WHAT the bug was, WHY it happened,
    and exactly HOW it was fixed, including which state variables / refs / patterns
    were involved.
  - Update it any time a design decision is made, even if the code change is small.
    The "why" matters as much as the "what".
  - Keep the exact file paths, constant names, CSS class names, and CSS custom
    property names in sync with the actual source files. If you rename a constant,
    rename it here too.
  - Prefer over-documenting to under-documenting. This document should make it
    possible for an AI to work on this codebase with zero additional file reads.

  Last updated: after horizontal white-card redesign, cedar SVG, SparklyText
  two-line restore, and card-height-stability fix.
-->

# Fundraising Tracker — AI Context Document

## Project purpose

A single-page React widget that displays live fundraising progress for a specific
campaign on Chuffed.org. It is designed to be open in a browser tab (e.g. during a
live stream or on a secondary monitor) and update itself automatically without any
user interaction. It is NOT a general-purpose fundraising tracker — it is hardwired
to one campaign and one platform.

The campaign: **"Do Not Worry Podcast Fundraiser"**, Chuffed.org campaign ID `147526`.

---

## Stack

| Technology      | Version | Role                                      |
| --------------- | ------- | ----------------------------------------- |
| React           | 19      | UI framework                              |
| Vite            | 7       | Dev server and bundler                    |
| Sass            | latest  | Component stylesheets (`.scss`)           |
| Framer Motion   | 12      | SparklyText per-letter rainbow animation  |
| canvas-confetti | 1.9     | Confetti burst on goal reached            |
| Inter           | —       | Google Font, linked in `index.html`       |
| Cedar_tiles.svg | —       | Lebanese cedar tree icon in `src/assets/` |

No router, no global state library, no backend. Everything runs in the browser.
API calls go directly from the browser to Chuffed.org's public API — no proxy.

---

## File structure (complete)

```
/
├── .env                          # VITE_THEME=1 or VITE_THEME=2 — controls active theme
├── index.html                    # Links Inter font (Google Fonts) and Material Symbols (unused but keep)
├── vite.config.js
├── package.json
├── eslint.config.js
├── doc/
│   └── CONTEXT.md                # This file — AI context document
├── public/
└── src/
    ├── main.jsx                  # React entry point — renders <App /> into #root
    ├── index.css                 # Bare reset only — DO NOT add card styles here
    ├── console.js                # (unused utility, do not delete)
    ├── constants.js              # All magic values: URLs, campaign ID, intervals, active theme
    ├── themes.js                 # Theme colour definitions keyed by theme number
    ├── App.jsx                   # Root component — all state, all polling, layout
    ├── App.scss                  # All card styles — BEM, SCSS, CSS custom props for theming
    ├── assets/
    │   └── Cedar_tiles.svg       # Lebanese cedar tree — single tree, viewBox 0 0 272.44444 247
    ├── api/
    │   └── chuffed.js            # All network calls to Chuffed.org — two exported async functions
    └── components/
        ├── AnimatedNumber.jsx    # Slot-machine rolling digit display
        ├── AnimatedNumber.scss
        ├── ConfettiAnimation.jsx # canvas-confetti burst, triggered by prop
        ├── ConfettiButton.jsx    # (unused component, do not delete)
        ├── FireworksDisplay.jsx  # (unused component, do not delete)
        ├── SparklyText.jsx       # Per-character rainbow animated heading using Framer Motion
        ├── SparklyText.scss      # SparklyText layout and colour filter for white background
        ├── Toast.jsx             # Superchat-style slide-in supporter notification
        └── Toast.scss
```

---

## Card layout — CRITICAL — read this before touching any layout CSS

The card is a **horizontal flex container** on a dark background. Layout summary:

```
.app                    — full-viewport flex, centers .card-wrapper
  .card-wrapper         — max-width 480px, position: relative (Toast anchor)
    <Toast />           — position: absolute inside .card-wrapper, NOT inside .card
    .card               — white pill, horizontal flex row, overflow: hidden
      .card__flag-bar--left   — solid colour bar, 18px wide, full height
      .card__body             — flex row, fixed height 150px, overflow: hidden
        .card__cedar          — 90px wide, align-self: stretch, position: relative
          .card__cedar-glow   — radial gradient blob behind tree (decorative)
          <img cedar-icon>    — the Cedar_tiles.svg, 90×90px
        .card__content        — flex column, justify-content: flex-start (MUST stay flex-start)
          <SparklyText />     — always two lines: "Do Not Worry" / "Podcast Fundraiser"
          <ConfettiAnimation />
          (loading or stats)
      .card__flag-bar--right  — solid colour bar, 18px wide, full height
```

### Why `.card__body` has a fixed height

`height: 150px` on `.card__body` prevents a visible height jump between the loading
state (SparklyText + "Loading…" text) and the loaded state (SparklyText + amount +
progress bar). Without a fixed height the card expands when stats load. **Do not
remove this fixed height.** If you need more vertical space, increase the value —
do not switch to `min-height` or `auto`.

### Why `.card__content` uses `justify-content: flex-start`

Changing this to `center` or `space-between` causes the SparklyText title to shift
downward when the card loads stats, because the content column height changes and
flex centering re-centres it. `flex-start` pins the title to the top of the column
at all times.

### Why `<Toast>` is outside `.card`

`.card` has `overflow: hidden` (needed to clip the flag bars flush to the rounded
corners). If `<Toast>` were inside `.card`, its slide-in animation (`translateX`)
would be clipped and never be visible. It must live in `.card-wrapper` which has
`position: relative` but no overflow clipping.

---

## src/index.css — intentionally minimal

```css
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
```

That is the entire file. There are NO card rules, NO `.card` selectors, NO colour
definitions here. All card styles are in `App.scss`. Do not add anything here.
Previous versions had `.card { background: #2c2c2c }` in this file which overrode
the white card — that bug has been permanently removed.

---

## src/constants.js — single source of truth for all magic values

```js
export const CAMPAIGN_ID = 147526;
export const GRAPHQL_URL = "https://chuffed.org/api/graphql";
export const SUPPORTERS_URL = `https://chuffed.org/api/v2/campaigns/${CAMPAIGN_ID}/supporters`;
export const FETCH_INTERVAL_MS = 5000;
export const ACTIVE_THEME = Number(import.meta.env.VITE_THEME ?? 1);
```

- `CAMPAIGN_ID` — Chuffed campaign ID. Used by both the GraphQL query and `SUPPORTERS_URL`.
- `FETCH_INTERVAL_MS` — polling interval in milliseconds (both API calls).
- `ACTIVE_THEME` — reads `VITE_THEME` from `.env`. Falls back to `1`. Converted to
  Number because env vars are always strings.

---

## src/themes.js — theme colour definitions

Two themes exist. Selected by `ACTIVE_THEME`. Currently `.env` has `VITE_THEME=2`.

Theme objects are consumed **exclusively in `App.jsx`** at module level (outside the
component function) to set CSS custom properties on `document.documentElement`.
Components never import `themes.js` directly.

### CSS custom properties applied at startup

| Property                     | What it controls                                 |
| ---------------------------- | ------------------------------------------------ |
| `--theme-flag-bar-left`      | Background colour of `.card__flag-bar--left`     |
| `--theme-flag-bar-right`     | Background colour of `.card__flag-bar--right`    |
| `--theme-progress-bar-bg`    | Progress bar fill (gradient or solid)            |
| `--theme-amount-color`       | Collected amount text colour                     |
| `--theme-title-accent`       | `.card__title-accent` colour (podcast name line) |
| `--theme-cedar-color`        | Cedar glow radial gradient colour                |
| `--theme-toast-gradient`     | Toast notification background gradient           |
| `--theme-toast-amount-color` | Amount text inside the Toast                     |

### Theme 1 — Palestinian

```js
flagBarLeft:    "#CE1126",   // red
flagBarRight:   "#007A3D",   // green
progressBarBg:  "linear-gradient(90deg, #CE1126 0%, #007A3D 100%)",
amountColor:    "#007A3D",
titleAccentColor: "#CE1126",
cedarColor:     "#007A3D",
toastGradient:  "linear-gradient(135deg, #007A3D 0%, #CE1126 100%)",
toastAmountColor: "#ffe163",
```

### Theme 2 — Lebanese (currently active)

```js
flagBarLeft:    "#EE161F",   // red — Lebanese flag has red on both sides
flagBarRight:   "#EE161F",   // red
progressBarBg:  "linear-gradient(90deg, #EE161F 0%, #00A850 100%)",
amountColor:    "#00A850",   // exact Lebanese flag cedar green
titleAccentColor: "#EE161F",
cedarColor:     "#00A850",
toastGradient:  "linear-gradient(135deg, #007A3D 0%, #CE1126 100%)",
toastAmountColor: "#ffe163",
```

---

## src/App.scss — all card styles

### Key CSS class reference

| Class                 | Role                                                          |
| --------------------- | ------------------------------------------------------------- |
| `.app`                | Full viewport, flex, centres `.card-wrapper`                  |
| `.card-wrapper`       | `max-width: 480px`, `position: relative` — Toast anchor       |
| `.card`               | White pill, `overflow: hidden`, horizontal flex, Inter font   |
| `.card__flag-bar`     | `width: 18px`, full height colour bar                         |
| `.card__body`         | `height: 150px` (fixed!), `overflow: hidden`, horizontal flex |
| `.card__cedar`        | `width: 90px`, `align-self: stretch`, tree + glow wrapper     |
| `.card__cedar-glow`   | Radial gradient blob, `opacity: 0.28`, `filter: blur(8px)`    |
| `.card__cedar-icon`   | `<img>` of Cedar_tiles.svg, `width: 90px; height: 90px`       |
| `.card__content`      | Flex column, `justify-content: flex-start` ← DO NOT CHANGE    |
| `.card__title`        | `color: #0f172a` ← near-black, DO NOT CHANGE                  |
| `.card__title-accent` | `color: var(--theme-title-accent, #ce1126)` ← DO NOT CHANGE   |
| `.card__stats`        | Amount + progress section                                     |
| `.card__amount-row`   | Amount + "raised of" label, horizontal                        |
| `.card__amount`       | `font-size: 1.7rem`, `color: var(--theme-amount-color)`       |
| `.card__raised-label` | Smaller text: "raised of £X,XXX"                              |
| `.card__loading`      | "Loading…" placeholder text                                   |
| `.progress-track`     | `width: 99%`, `height: 0.75rem`, rounded track                |
| `.progress-fill`      | `background: var(--theme-progress-bar-bg)`, animated width    |
| `.progress-labels`    | `font-size: 0.52rem` percentage labels below bar              |

### Title colour rules — NEVER CHANGE THESE

```scss
.card__title {
  color: #0f172a; // near-black — hardcoded, not themed, not important
}
.card__title-accent {
  color: var(--theme-title-accent, #ce1126); // themed red
}
```

Do NOT add `!important`. Do NOT hardcode a different colour. Do NOT move these into
a theme object. The title text is always dark-on-white; only the accent line is themed.

### html/body background

```scss
html,
body {
  background: #2c2c2c; // dark grey — the "stage" behind the card
}
```

---

## src/assets/Cedar_tiles.svg — the cedar tree icon

A single Lebanese cedar tree. The SVG was edited down from a 9-tree tile sheet:

- All 8 `<use>` clone elements were removed, leaving only the original `<path>`
- viewBox shrunk from `0 0 817 741` to `0 0 272.44444 247`
- `fill: #00813b` on the path (overridden at render time by CSS if needed)
- Imported as a URL in `App.jsx` via `import CedarSvg from "./assets/Cedar_tiles.svg"`
- Rendered as `<img src={CedarSvg} className="card__cedar-icon" alt="Cedar tree" />`

**Do not re-add `<use>` elements.** The tile layout was intentionally removed.

---

## src/App.jsx — root component, full breakdown

### Imports

```js
import CedarSvg from "./assets/Cedar_tiles.svg";
import SparklyText from "./components/SparklyText";
import { THEMES } from "./themes";
import { FETCH_INTERVAL_MS, ACTIVE_THEME } from "./constants";
import { fetchCampaign, fetchLatestSupporter } from "./api/chuffed";
```

### Module-level theme application (outside component, runs once on import)

```js
const theme = THEMES[ACTIVE_THEME] ?? THEMES[1];
document.documentElement.style.setProperty(
  "--theme-flag-bar-left",
  theme.flagBarLeft,
);
document.documentElement.style.setProperty(
  "--theme-flag-bar-right",
  theme.flagBarRight,
);
document.documentElement.style.setProperty(
  "--theme-progress-bar-bg",
  theme.progressBarBg,
);
document.documentElement.style.setProperty(
  "--theme-amount-color",
  theme.amountColor,
);
document.documentElement.style.setProperty(
  "--theme-title-accent",
  theme.titleAccentColor,
);
document.documentElement.style.setProperty(
  "--theme-cedar-color",
  theme.cedarColor,
);
document.documentElement.style.setProperty(
  "--theme-toast-gradient",
  theme.toastGradient,
);
document.documentElement.style.setProperty(
  "--theme-toast-amount-color",
  theme.toastAmountColor,
);
```

This runs before the first render. All theming flows through CSS vars on `:root`.
No inline styles on JSX elements for theming.

### SparklyText colours (NOT themed)

```js
const SPARKLY_COLORS = [
  "#FF8000",
  "#FFE163",
  "#FEA5D9",
  "#0DC2F5",
  "#02F2A8",
  "#06EFA7",
  "#FEE062",
  "#FAA906",
];
```

These are module-level constants. They are rainbow/warm colours hardcoded for the
heading — not part of the theme system. The heading always looks the same regardless
of which theme is active.

### State

| State variable       | Type         | Purpose                                                        |
| -------------------- | ------------ | -------------------------------------------------------------- |
| `amount`             | number       | Collected amount in main currency units                        |
| `target`             | number       | Target amount in main currency units                           |
| `currency`           | string       | Currency symbol, e.g. `"£"`                                    |
| `percentage`         | number       | `(amount / target) * 100`, capped at 100                       |
| `displayPercentage`  | number       | Animated version of `percentage` — drives progress bar width   |
| `loading`            | boolean      | True until first successful `fetchCampaign()` response         |
| `celebrationTrigger` | boolean      | Pulses to `true` for 5s when amount === target                 |
| `newSupporter`       | object\|null | Supporter object shown in Toast; set to null when Toast closes |

### Ref — toast deduplication

```js
const lastSupporterIdRef = useRef(null);
```

Tracks the `id` of the last supporter that triggered a Toast. This is a `useRef`
(NOT state) for a critical reason: if it were state, calling `setNewSupporter(null)`
(closing the Toast) would cause a re-render and on the next poll `lastSupporterId`
would be null again — making the same supporter re-appear. A ref persists across
renders without causing re-renders and is NOT reset when toast state clears.

### useEffect 1 — data fetching (runs once on mount)

Defines `loadCampaign` and `loadSupporters`, calls both immediately, then repeats
both every `FETCH_INTERVAL_MS` via `setInterval`. Returns cleanup that clears interval.

Supporter deduplication check:

```js
if (latest.id !== lastSupporterIdRef.current) {
  lastSupporterIdRef.current = latest.id;
  setNewSupporter(latest);
}
```

On first load `lastSupporterIdRef.current` is `null`, so the latest supporter
**always** shows on page load/refresh. On subsequent polls, only a new ID triggers Toast.

### useEffect 2 — celebration trigger

Watches `amount` and `target`. When both match and are > 0, sets `celebrationTrigger`
to `true` for 5000ms.

### useEffect 3 — progress bar animation

When `percentage` changes, animates `displayPercentage` from its previous value to
the new target over 2000ms using a cubic ease-out via `requestAnimationFrame`.
`displayPercentage` is intentionally excluded from the dependency array (eslint
warning suppressed) — including it would cause infinite re-triggering.

---

## src/components/SparklyText.jsx / SparklyText.scss

Renders a heading as rows of individually coloured animated letters. Each letter
cycles through the `colors` array using Framer Motion animating `backgroundPosition`
on a `background-clip: text` gradient.

**Two lines** are passed from App.jsx:

```jsx
<SparklyText
  lines={["Do Not Worry", "Podcast Fundraiser"]}
  colors={SPARKLY_COLORS}
/>
```

### SparklyText.scss key values

- `font-size: 1.15rem`, `font-weight: 900`, `text-transform: uppercase`
- `justify-content: flex-start` (left-aligned)
- `.sparkly-letter`: `filter: brightness(0.68) saturate(1.6)` — darkens the rainbow
  colours so they're legible on the white card background
- `.sparkly-letter`: `text-shadow: 0 1px 2px rgba(0,0,0,0.15)`
- `.sparkly-line`: `flex-wrap: nowrap`

The `filter: brightness(0.68)` is essential — without it the letters are too pale
on white. Do not remove it.

---

## src/components/Toast.jsx / Toast.scss

### Purpose

Slide-in superchat-style notification showing the latest supporter's name and amount.

### Props

- `supporter` — object or null. Component returns null when this is null.
- `onClose` — callback, called after the slide-out transition completes.

### Lifecycle

1. `supporter` becomes non-null → `isVisible = true` (slides in).
2. After 4000ms → `isVisible = false` (slides out).
3. After 300ms (transition) → `onClose()` called → `newSupporter = null` in App.jsx.

### CRITICAL positioning

Toast is `position: absolute` anchored inside `.card-wrapper` (`position: relative`).
It is **not inside `.card`**. If you move it inside `.card`, the `overflow: hidden`
on `.card` will clip the slide-in animation and the toast will never be visible.

### Display logic

- Name: `supporter.is_anonymous ? "Anonymous" : supporter.name`
- Amount: `${supporter.currency_symbol}${supporter.amount}`

### Styling

Background: `var(--theme-toast-gradient)` — changes with theme.
Amount colour: `var(--theme-toast-amount-color)`.

---

## src/api/chuffed.js — all network calls

Exports two async functions. Both throw on network errors (callers catch with
`console.error`).

### `fetchCampaign()`

```
POST GRAPHQL_URL
Body: JSON array (batch format) with operationName "getCampaign",
      variables { id: CAMPAIGN_ID }, and a query string.
```

Response is an array — `data[0].data.campaign` is the campaign object.
Amounts from the API are in pence/cents (× 100). Divided by 100 and floored before
returning. Returns: `{ collectedAmount, targetAmount, currency }`.

### `fetchLatestSupporter()`

```
GET SUPPORTERS_URL?limit=20&offset=0
```

Returns `data.data[0]` (most recent) or `null` if empty. Does not paginate.

Supporter object fields used by the app:

```
id              — integer; unique per donation; change-detection key for Toast dedup
name            — display name string
is_anonymous    — boolean; true → show "Anonymous"
amount          — number in main currency units (NOT × 100)
currency_symbol — string e.g. "£"
```

---

## src/components/AnimatedNumber.jsx

Takes a `value` (number), formats with `toLocaleString("en-US")` (hardcoded locale
for consistent comma separators), splits into chars. Commas render as static
`.separator` spans; digits render as `<RollingDigit>` components that scroll a
`[0..9, 0..9]` vertical strip via CSS `translateY`.

---

## Bugs fixed — do not reintroduce

| Bug                                           | Root cause                                                                                        | Fix                                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Card background was dark (#111)               | Duplicate old CSS block remained in App.scss after rewrite                                        | Removed the duplicate block; App.scss now has exactly one `.card { background: #fff }` rule                   |
| Old index.css overriding white card           | `index.css` had `.card { background: #2c2c2c }` from original design                              | Stripped all rules from `index.css`, kept only bare html/body reset                                           |
| Toast clipped, never visible                  | `<Toast>` was inside `.card` which has `overflow: hidden`                                         | Moved `<Toast>` outside `.card`, into `.card-wrapper` which has `position: relative` but no overflow clipping |
| Card height jumps on first load               | `__body` had no fixed height; loading state was shorter than loaded state                         | Added `height: 150px; overflow: hidden` to `.card__body`                                                      |
| SparklyText title shifts on load              | `.card__content` had `justify-content: center`; centering recalculates as stats render            | Changed to `justify-content: flex-start` — title stays pinned to top                                          |
| Same supporter re-appeared after Toast closed | Toast-close called `setNewSupporter(null)` (state), causing re-render; next poll saw `null` again | Replaced `lastSupporterId` state with `lastSupporterIdRef = useRef(null)` — ref doesn't trigger re-render     |
| 9 cedar trees shown                           | Cedar_tiles.svg was a tile sheet with 1 original + 8 `<use>` clones                               | Removed all 8 `<use>` elements; shrank viewBox from `817×741` to `272×247`                                    |
| Title colours being accidentally changed      | Prior CSS edits hardcoded wrong values or added `!important`                                      | Stabilised as `#0f172a` (title) and `var(--theme-title-accent, #ce1126)` (accent); no `!important`            |

---

## Things that are intentionally fragile — do not "clean up"

- `console.js`, `ConfettiButton.jsx`, `FireworksDisplay.jsx` — unused but kept
  intentionally. Do not delete.
- Material Symbols CSS link in `index.html` — no longer used in JSX but kept to
  avoid breaking anything if icons are re-added later.
- `eslint-disable-next-line react-hooks/exhaustive-deps` comment in useEffect 3 —
  intentional, removing it would break the animation.
- `index.css` minimal content — do not add card or component styles here.

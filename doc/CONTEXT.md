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

  Last updated: dark card redesign, DNW logo PNG, favicon, AnimatedNumber mount-guard
  fix, TTS_MIN_AMOUNT threshold, Toast rounded corners, card height stability,
  celebration >= fix, dev +£500 button, responsive layout, mobile TTS unlock,
  TOAST_ENABLED constant, OBS Browser Source setup, Kokoro neural TTS integration,
  per-goal confetti fix, TTS_KOKORO_ENABLED constant.
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

| Technology      | Version | Role                                        |
| --------------- | ------- | ------------------------------------------- |
| React           | 19      | UI framework                                |
| Vite            | 7       | Dev server and bundler                      |
| Sass            | latest  | Component stylesheets (`.scss`)             |
| Framer Motion   | 12      | SparklyText per-letter rainbow animation    |
| canvas-confetti | 1.9     | Confetti burst on goal reached              |
| Inter           | —       | Google Font, linked in `index.html`         |
| dnw-logo.png    | —       | DNW logo PNG in `src/assets/` and `public/` |

No router, no global state library, no backend. Everything runs in the browser.
API calls go directly from the browser to Chuffed.org's public API — no proxy.

---

## File structure (complete)

```
/
├── .env                          # VITE_THEME env var no longer used (Variation 4 has fixed palette)
├── index.html                    # favicon → /favicon.png (DNW logo, square, transparent bg)
├── vite.config.js
├── package.json
├── eslint.config.js
├── doc/
│   └── CONTEXT.md                # This file — AI context document
├── public/
│   ├── favicon.png               # Square transparent-bg favicon generated from dnw-logo.png
│   └── dnw-logo.png              # Copy of the logo for static serving if needed
└── src/
    ├── main.jsx                  # React entry point — renders <App /> into #root
    ├── index.css                 # Bare reset only — DO NOT add card styles here
    ├── console.js                # (unused utility, do not delete)
    ├── constants.js              # All magic values: URLs, campaign ID, intervals, TTS settings
    ├── themes.js                 # Theme definitions — kept for reference, no longer used at runtime
    ├── App.jsx                   # Root component — all state, all polling, layout
    ├── App.scss                  # All card styles — BEM, SCSS (Variation 4 dark palette)
    ├── assets/
    │   ├── Cedar_tiles.svg       # Lebanese cedar tree — kept, no longer used in main card
    │   └── dnw-logo.png          # DNW logo used in card and as favicon source
    ├── api/
    │   └── chuffed.js            # All network calls to Chuffed.org — two exported async functions
    └── components/
        ├── AnimatedNumber.jsx    # Slot-machine rolling digit display
        ├── AnimatedNumber.scss
        ├── ConfettiAnimation.jsx # canvas-confetti burst, triggered by prop
        ├── ConfettiButton.jsx    # (unused component, do not delete)
        ├── FireworksDisplay.jsx  # (unused component, do not delete)
        ├── SparklyText.jsx       # Per-character rainbow animated heading (unused in V4, do not delete)
        ├── SparklyText.scss
        ├── Toast.jsx             # Superchat-style slide-in supporter notification
        └── Toast.scss
```

---

## Card layout — CRITICAL — read this before touching any layout CSS

The card is a **Variation 4 dark design** ported from a Figma export. Layout summary:

```
.app                    — full-viewport flex, centers .card-wrapper
  .card-wrapper         — max-width 480px, position: relative (Toast anchor)
    <Toast />           — position: absolute inside .card-wrapper, NOT inside .card
    <ConfettiAnimation />
    .card               — dark pill (#1f2028), horizontal flex row, left cyan border
      .card__logo       — 128px wide, holds <img> of dnw-logo.png
      .card__content    — flex column, gap 0.45rem
        .card__header-row   — flex row: title left, amount right
          h3.card__title    — "DNW Fundraiser", cyan, uppercase, tiny
          .card__amount     — green, large, AnimatedNumber (hidden while loading)
        (loading text OR:)
        .card__progress     — progress bar wrapper
          .progress-track   — dark track
            .progress-fill  — pink→magenta→cyan gradient
        .card__meta-row     — percentage + goal label left, "Active" right
```

### Why `<AnimatedNumber>` is guarded by `!loading`

`AnimatedNumber` renders digit slots based on the digit count of the current value.
If it mounts with `value=0` (1 digit) and then `amount` changes to e.g. `12504`
(5 digits), the new digit slots appear instantaneously at their final values while
only the first digit animates — producing a glitch like `02,504 → 12,504`. The fix
is to keep `AnimatedNumber` unmounted during loading so it always mounts with the
correct digit count. After first load it stays mounted and rolls on every update.

### Why `<Toast>` is outside `.card`

`.card` has no `overflow: hidden` in V4 (no flag bars to clip), but `<Toast>` must
still stay in `.card-wrapper` (which has `position: relative`) to anchor its
`position: absolute` correctly.

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
export const CAMPAIGN_ID = 172939;
export const GRAPHQL_URL = "https://chuffed.org/api/graphql";
export const SUPPORTERS_URL = `https://chuffed.org/api/v2/campaigns/${CAMPAIGN_ID}/supporters`;
export const FETCH_INTERVAL_MS = 5000;
export const TTS_ENABLED = true;
export const TTS_VOICE = "Google UK English Male";
export const TTS_KOKORO_ENABLED = true;
export const TTS_KOKORO_VOICE = "bm_daniel";
export const TTS_MIN_AMOUNT = 1;
export const TOAST_ENABLED = true;
```

- `CAMPAIGN_ID` — Chuffed campaign ID. Used by both the GraphQL query and `SUPPORTERS_URL`.
- `FETCH_INTERVAL_MS` — polling interval in milliseconds (both API calls).
- `TTS_ENABLED` — set to `false` to silence ALL speech (both browser voice and AI voice).
- `TTS_VOICE` — browser voice name used as fallback while Kokoro loads, or always when
  `TTS_KOKORO_ENABLED = false`. See file comments for full list of available voices.
- `TTS_KOKORO_ENABLED` — set to `false` to skip the Kokoro AI model entirely and always
  use the browser voice. `TTS_ENABLED = false` overrides this and silences everything.
- `TTS_KOKORO_VOICE` — voice key for the Kokoro neural engine. Format: `{region}{gender}_{name}`
  where region is `a` (American) or `b` (British), gender is `f` (female) or `m` (male).
  Examples: `bm_george`, `bm_daniel`, `bf_emma`, `af_heart`, `am_fenrir`.
- `TTS_MIN_AMOUNT` — minimum donation (in main currency units, e.g. £) required to trigger
  a spoken announcement. Below this value Toast still shows but speech is skipped. Set to
  `0` to speak all donations.
- `TOAST_ENABLED` — set to `false` to hide the on-screen donor Toast notification entirely.

---

## src/themes.js — theme colour definitions (retained, not active)

Two themes (Palestinian, Lebanese) are defined here. The theme system is no longer
used at runtime — `App.jsx` and `App.scss` use a hardcoded dark palette. `themes.js`
is kept in case the theme system is restored in future. Do not delete it.

### Current card colours (set in App.jsx at module level)

| CSS custom property          | Value                                               | What it controls     |
| ---------------------------- | --------------------------------------------------- | -------------------- |
| `--theme-toast-gradient`     | `linear-gradient(135deg, #FF6B9D 0%, #66CCFF 100%)` | Toast background     |
| `--theme-toast-amount-color` | `#4ade80`                                           | Amount text in Toast |

---

## src/App.scss — all card styles (dark palette)

### Key CSS class reference

| Class               | Role                                                                    |
| ------------------- | ----------------------------------------------------------------------- |
| `.app`              | Full viewport, flex, centres `.card-wrapper`                            |
| `.card-wrapper`     | `max-width: 480px`, `position: relative` — Toast anchor                 |
| `.card`             | Dark pill `rgba(31,32,40,0.95)`, `border-left: 4px solid #66ccff`       |
| `.card__logo`       | `width: 128px`, flex-shrink 0, holds DNW logo PNG                       |
| `.card__logo-img`   | `width: 100%`, `height: auto`, `object-fit: contain`                    |
| `.card__content`    | Flex column, `gap: 0.45rem`                                             |
| `.card__header-row` | Flex row, space-between: title left, amount right                       |
| `.card__title`      | `color: #66ccff`, uppercase, `font-size: 0.65rem`, bold                 |
| `.card__amount`     | `color: #4ade80`, `font-size: 1.4rem`, bold — **only shown after load** |
| `.card__loading`    | "Loading…" placeholder, `color: #9ca3af`                                |
| `.card__progress`   | Progress bar wrapper                                                    |
| `.card__meta-row`   | Flex row, space-between                                                 |
| `.card__meta-left`  | `color: #ff6b9d`, uppercase tiny — percentage + goal                    |
| `.card__meta-right` | `color: #9ca3af` — "Active" status label                                |
| `.progress-track`   | `height: 0.5rem`, `background: #2a2c35`, rounded                        |
| `.progress-fill`    | `background: linear-gradient(90deg, #ff9966, #ff6b9d, #66ccff)`         |

### html/body background

```scss
html,
body {
  background: #2c2c2c;
} // dark grey stage behind the card
```

---

## src/assets/dnw-logo.png — primary logo

- Source: Figma export asset `2948d085ef6ce208f4bff2140ba68811310a3142.png` from
  `src/Fundraiser Card Variations/src/assets/`
- Copied into `src/assets/dnw-logo.png` for use in the React app
- Also copied into `public/dnw-logo.png` for static serving
- Original dimensions: 2338×827px (very wide)
- Imported in `App.jsx` as `import DnwLogo from "./assets/dnw-logo.png"`
- Rendered as `<img src={DnwLogo} className="card__logo-img" alt="DNW Logo" />`

## public/favicon.png — browser tab icon

- Generated from `dnw-logo.png` via ImageMagick:
  `magick dnw-logo.png -resize 512x512 -gravity center -background none -extent 512x512 favicon.png`
- 512×512, transparent background — logo fills full width, centred vertically
- Referenced in `index.html` as `<link rel="icon" type="image/png" href="/favicon.png" />`

## src/assets/Cedar_tiles.svg — kept, not used in main card

Edited single-tree cedar SVG from original tile sheet. No longer rendered in the
main card after the V4 redesign. Do not delete — may be reused.

---

## src/App.jsx — root component, full breakdown

### Imports

```js
import DnwLogo from "./assets/dnw-logo.png";
import {
  FETCH_INTERVAL_MS,
  TTS_ENABLED,
  TTS_VOICE,
  TTS_MIN_AMOUNT,
} from "./constants";
import { fetchCampaign, fetchLatestSupporter } from "./api/chuffed";
```

`SparklyText`, `CedarSvg`, `THEMES`, and `ACTIVE_THEME` are no longer imported.

### Module-level CSS var application (outside component, runs once on import)

Only the two Toast-related CSS vars are set — the rest of V4's palette is hardcoded
in `App.scss`:

```js
document.documentElement.style.setProperty(
  "--theme-toast-gradient",
  "linear-gradient(135deg, #FF6B9D 0%, #66CCFF 100%)",
);
document.documentElement.style.setProperty(
  "--theme-toast-amount-color",
  "#4ade80",
);
```

### State

| State variable       | Type         | Purpose                                                                                                                      |
| -------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `amount`             | number       | Collected amount in main currency units                                                                                      |
| `target`             | number       | Target amount in main currency units                                                                                         |
| `currency`           | string       | Currency symbol, e.g. `"£"`                                                                                                  |
| `percentage`         | number       | `(amount / target) * 100`, capped at 100                                                                                     |
| `displayPercentage`  | number       | Animated version of `percentage` — drives progress bar width                                                                 |
| `loading`            | boolean      | True until first successful `fetchCampaign()` response                                                                       |
| `celebrationTrigger` | boolean      | Pulses to `true` for 5s when a goal is reached for the first time                                                           |
| `newSupporter`       | object\|null | Supporter object shown in Toast; set to null when Toast closes                                                               |
| `soundUnlocked`      | boolean      | Whether user has clicked to unlock browser speech. Mirrors `soundUnlockedRef` as state so the unlock button re-renders away. |

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

Supporter deduplication check + TTS threshold:

```js
if (latest.id !== lastSupporterIdRef.current) {
  lastSupporterIdRef.current = latest.id;
  setNewSupporter(latest); // always show Toast
  // Only speak if donation meets the minimum threshold
  if (Number(latest.amount) >= TTS_MIN_AMOUNT) {
    if (soundUnlockedRef.current) {
      speakTts(text);
    } else {
      pendingTtsRef.current = text;
    }
  }
}
```

The Toast always appears regardless of amount. Only the spoken announcement is
threshold-gated. `TTS_MIN_AMOUNT` is set in `constants.js`.

On first load `lastSupporterIdRef.current` is `null`, so the latest supporter
**always** shows on page load/refresh. On subsequent polls, only a new ID triggers Toast.

### Ref — celebration deduplication

```js
const celebratedTargetRef = useRef(null);
```

Tracks the `target` value for which confetti has already fired. Confetti only fires
when `amount >= target` AND `target !== celebratedTargetRef.current`. On firing,
`celebratedTargetRef.current` is set to the current `target` so further donations
beyond the same goal don't re-trigger. When the streamer raises the goal, the new
`target` won't match the ref, so the new goal can fire confetti exactly once.

### useEffect 2 — celebration trigger

Watches `amount` and `target`. When `amount >= target`, both > 0, and this target
hasn't been celebrated yet, sets `celebrationTrigger` to `true` for 5000ms and
records the target in `celebratedTargetRef`.

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

| Bug                                           | Root cause                                                                                          | Fix                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Card background was dark (#111)               | Duplicate old CSS block remained in App.scss after rewrite                                          | Removed the duplicate block                                                                               |
| Old index.css overriding white card           | `index.css` had `.card { background: #2c2c2c }` from original design                                | Stripped all rules from `index.css`, kept only bare html/body reset                                       |
| Toast clipped, never visible                  | `<Toast>` was inside `.card` which has `overflow: hidden`                                           | Moved `<Toast>` outside `.card`, into `.card-wrapper`                                                     |
| Card height jumps on first load               | `__body` had no fixed height; loading state was shorter than loaded state                           | Added `height: 150px; overflow: hidden` to `.card__body` (pre-V4; V4 uses natural height)                 |
| SparklyText title shifts on load              | `.card__content` had `justify-content: center`                                                      | Changed to `justify-content: flex-start` (pre-V4; V4 doesn't use SparklyText)                             |
| Same supporter re-appeared after Toast closed | Toast-close called `setNewSupporter(null)` (state), causing re-render; next poll saw `null` again   | Replaced `lastSupporterId` state with `lastSupporterIdRef = useRef(null)` — ref doesn't trigger re-render |
| AnimatedNumber shows `02,504` glitch on load  | Component mounted with `value=0`, new digit slots appeared instantly at final values                | Guard `<AnimatedNumber>` with `!loading` so it always mounts with correct digit count                     |
| Favicon stretched in browser tab              | Logo PNG is 2338×827 (very wide); browsers squash non-square favicons                               | Generated `favicon.png` via ImageMagick: 512×512, transparent bg, logo centred                            |
| Title "DNW Fundraiser" bounced on load        | `card__header-row` had no fixed height; it grew when the large amount appeared beside the title     | Added `min-height: 2rem` to `.card__header-row` to reserve space from the start                           |
| Card height jumped on load                    | `card__content` had no minimum height; loading state was shorter than loaded state                  | Added `min-height: 72px` to `.card__content`                                                              |
| Toast had flat right edge                     | `border-radius: 8px 0 0 8px` — intentional for old flush-to-card design                             | Changed to `border-radius: 8px` (all corners rounded)                                                     |
| Confetti never fired when goal was exceeded   | Celebration check used `amount === target` (strict equality); polling interval can skip exact value | Changed to `amount >= target` so any value at or above goal triggers confetti                             |

---

## Future option: Comments API

Chuffed provides a comments endpoint separate from supporters:

```
GET https://chuffed.org/api/v2/campaigns/{CAMPAIGN_ID}/comments
```

Response shape:

```json
{
  "data": [
    {
      "id": 100248,
      "is_anonymous": false,
      "children_count": 0,
      "content": "Comment text here",
      "user": {
        "data": {
          "id": 2363809,
          "image": null,
          "first_name": "Doan",
          "last_name": "Nguyen"
        }
      }
    }
  ],
  "meta": { "total": 2, "offset": 0, "limit": 250, "count": 2 }
}
```

Key differences from supporters: no `amount`, no `currency_symbol` — just `content`
and `user`. If implemented, a `fetchLatestComment()` function should follow the same
structure as `fetchLatestSupporter()` and use `id` for deduplication. A separate
Toast variant (or the existing Toast extended) would display the comment text.
This was not implemented — noted here for future reference.

---

## Things that are intentionally fragile — do not "clean up"

- `console.js`, `ConfettiButton.jsx`, `FireworksDisplay.jsx` — unused but kept
  intentionally. Do not delete.
- Material Symbols CSS link in `index.html` — no longer used in JSX but kept to
  avoid breaking anything if icons are re-added later.
- `eslint-disable-next-line react-hooks/exhaustive-deps` comment in useEffect 3 —
  intentional, removing it would break the animation.
- `index.css` minimal content — do not add card or component styles here.
- Dev `+£500` button in `App.jsx` — wrapped in `import.meta.env.DEV` guard, only
  visible in development. Do not remove — useful for testing animations and confetti.
  Also bumps `percentage` state proportionally so the progress bar reflects the change.

---

## OBS Browser Source setup

This app is designed to run as an **OBS Browser Source** with a transparent background,
so only the card is visible on stream. No special OBS plugin is needed — OBS has a
built-in Browser Source.

### Relevant code changes for OBS

- `vite.config.js` — `base: './'` so all asset paths in the built output are relative.
  This is required when loading `dist/index.html` from disk rather than a web server.
- `App.scss` — `html, body { background: transparent }` so the page background is
  invisible in OBS (only the card renders).

### How to build

```bash
npm run build
```

Outputs to `dist/`. The entry point is `dist/index.html`.

### How to add as an OBS Browser Source

1. In OBS: **Sources → + → Browser**
2. Check **"Local file"** and point it to `dist/index.html`
3. Set **Width: 520**, **Height: 160** (fits the card at its natural size)
4. In the **Custom CSS** box add:
   ```css
   body { background-color: rgba(0, 0, 0, 0) !important; }
   ```
5. Click **OK** — the card appears as a transparent overlay

Alternatively, if the app is deployed to a URL (GitHub Pages, Vercel, etc.), paste
the URL instead of using the local file option. The `base: './'` change does not
affect hosted deployments.

### TTS in OBS

OBS Browser Source runs in a Chromium-based engine. The Web Speech API and Web Audio
API are both available. All TTS constants work. Autoplay policy means the user must
interact before sound plays — the **🔊 Click to enable donation sounds** button
appears on first load inside OBS; right-click the source → **Interact** → click the
button → close the interaction panel.

The Kokoro neural TTS model (~80 MB, q4 quantised) is downloaded from Hugging Face
on first click and cached in OBS's Chromium cache on disk. Subsequent OBS restarts
load the model from cache in a few seconds — no re-download unless the OBS cache is
manually cleared. While the model downloads in the background, the browser Web Speech
API is used as a fallback so no donation announcements are missed.

To skip the AI model entirely, set `TTS_KOKORO_ENABLED = false` in `constants.js`.

### TOAST_ENABLED constant

Added to `constants.js`. Set to `false` to hide the donor toast notification
entirely (e.g. if you want only TTS and no on-screen popup).

```js
export const TOAST_ENABLED = true; // false to disable donor toast
```

### Responsive layout

A `@media (max-width: 520px)` block in `App.scss` stacks the card vertically
(logo above content) on small screens. Uses `100dvh` (dynamic viewport height)
to account for mobile browser chrome. `touchstart` is registered alongside `click`
and `keydown` for TTS unlock on iOS Safari.

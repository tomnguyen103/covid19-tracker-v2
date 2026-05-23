# Implementation Notes

Running log of decisions made during the Vite migration that weren't in the spec.

---

## Decisions

<!-- Add entries as you work. Format:
**[Task N] Title**
Decision made, why, and trade-off.
-->

**[Task 2] Dropped `npm start` in favour of `npm run dev`**
Vite's dev script is `vite`, not `react-scripts start`. CLAUDE.md updated in Task 15. Muscle memory may need adjusting.

**[Task 2] Kept `public/` folder for future static assets**
CRA's `public/index.html` is deleted (Vite uses root-level `index.html`), but the `public/` directory itself is kept — Vite serves it as-is for static assets.

**[Task 10] Used MUI Grid2 (`@mui/material/Grid2`)**
MUI v6 deprecates the old `Grid`. Grid2 uses a `size` prop (`size={{ xs: 12, md: 4 }}`) instead of separate `xs`/`md` props. Slightly different API; documented here so future readers aren't confused.

**[Task 9] COVID logo moved to AppBar**
The original `App.js` rendered the COVID image above the cards. In the new layout it's placed as a small icon in the AppBar next to the title — cleaner and saves vertical space.

**[Task 13] `countryA === null` means Global**
Empty string was the original signal for "no country". Switched to `null` for explicit intent. The `useSnapshot` hook receives `undefined` when country is `null`, which hits the `/all` endpoint.

**[Task 13] `snapshotBQuery` uses `enabled: !!countryB`**
Prevents an unnecessary `/all` fetch when no comparison country is chosen. TanStack Query won't run a disabled query.

---

## Things to watch

- disease.sh API occasionally returns 0 for `recovered` on country endpoints — this is a data quality issue in the upstream API, not a bug here.
- `react-countup` animates from 0 every time the component re-renders with a new country. This is acceptable UX for now.

# COVID-19 Tracker — Vite Migration Design

**Date:** 2026-05-22  
**Status:** Approved  
**Approach:** In-place CRA teardown → Vite + TypeScript + TanStack Query + MUI v6 + Tailwind + Recharts

---

## 1. Goals

Modernise the existing CRA-based COVID-19 tracker to a current stack without changing the core product (same data source, same three stat cards, same line/bar chart pattern), while adding:

- Dark mode toggle
- Country comparison (two countries, grouped bar chart)
- Proper error and loading states (Skeleton + Alert + retry)
- Vitest + Testing Library test infrastructure (no tests yet, just the scaffold)

---

## 2. Stack

| Layer | Old | New |
|---|---|---|
| Bundler | CRA (webpack 4) | Vite |
| Language | JS (.jsx) | TypeScript (.tsx) |
| Data fetching | axios + useEffect | TanStack Query v5 + native fetch |
| UI components | MUI v4 | MUI v6 |
| Styling | CSS Modules | MUI `sx` prop + Tailwind utilities |
| Charts | react-chartjs-2 v2 | Recharts |
| Testing | none | Vitest + Testing Library |

---

## 3. File Structure

```
src/
  api/
    covidApi.ts            # all disease.sh fetch functions, typed
  components/
    Cards/
      Cards.tsx            # maps config array → StatCard instances
      StatCard.tsx         # single stat card (extracted for testability)
    Chart/
      Chart.tsx            # Line (global) or Bar (country/comparison)
    CountryPicker/
      CountryPicker.tsx    # MUI Autocomplete, keyboard-searchable
    ErrorBoundary.tsx      # catches render errors app-wide
    Layout.tsx             # top bar: logo left, dark mode toggle right
  hooks/
    useSnapshot.ts         # TanStack Query: fetchSnapshot(country?)
    useDailyData.ts        # TanStack Query: fetchDailyData()
    useCountries.ts        # TanStack Query: fetchCountries()
  theme/
    theme.ts               # MUI createTheme, light + dark palettes
    ThemeContext.tsx        # ColorModeContext + toggle provider
  types/
    covid.ts               # shared TypeScript interfaces
  test/
    setup.ts               # imports @testing-library/jest-dom
    utils.tsx              # renderWithProviders helper (QueryClient + Theme)
  App.tsx                  # root: providers + layout + state
  main.tsx                 # Vite entry point
```

All `.module.css` files are deleted. No CRA config files remain.

---

## 4. Data Layer

### 4.1 Types (`src/types/covid.ts`)

```ts
export interface CovidSnapshot {
  confirmed: number;
  recovered: number;
  deaths: number;
  lastUpdate: number; // Unix ms timestamp
}

export interface DailyPoint {
  date: string;
  confirmed: number;
  deaths: number;
}

export type Country = string;
```

### 4.2 API (`src/api/covidApi.ts`)

Three functions using native `fetch` (axios removed):

- `fetchSnapshot(country?: string): Promise<CovidSnapshot>` — hits `/all` or `/countries/{country}`
- `fetchDailyData(): Promise<DailyPoint[]>` — hits `/historical/all?lastdays=all`, converts `Object.entries` to array
- `fetchCountries(): Promise<Country[]>` — hits `/countries`, extracts `.country` strings

All functions throw on non-ok HTTP status so TanStack Query can catch them.

### 4.3 Query Hooks

| Hook | Query key | staleTime | Notes |
|---|---|---|---|
| `useSnapshot(country?)` | `['snapshot', country]` | 5 min | Re-fetches when country changes |
| `useDailyData()` | `['daily']` | 1 hour | Fetched once, historical data |
| `useCountries()` | `['countries']` | 1 day | Near-static list |

Each hook returns `{ data, isLoading, isError, refetch }` — components destructure what they need.

---

## 5. Components

### 5.1 App.tsx

Function component. State:
- `countryA: string` — primary country, defaults to `""` (Global)
- `countryB: string | null` — comparison country, defaults to `null`

Wraps everything in `QueryClientProvider`, `ColorModeProvider`, `ThemeProvider`, `CssBaseline`, `ErrorBoundary`.

### 5.2 Layout.tsx

Thin MUI `AppBar` with:
- Left: COVID-19 logo + title
- Right: sun/moon `IconButton` toggling dark mode via `ColorModeContext`

### 5.3 Cards / StatCard

`Cards.tsx` maps a config array of `{ title, value, description, color }` to `StatCard` components.

`StatCard.tsx` renders a single MUI `Card` with:
- `CountUp` animation on the number
- Last-updated date string
- Color accent via `sx` border-top

Loading state: card-shaped `Skeleton`.  
Error state: `Alert severity="error"` with retry button.

### 5.4 CountryPicker

Two instances rendered in `App`:
- **Primary** — label "Country", value `countryA`
- **Comparison** — label "Compare with…", value `countryB`, clearable

MUI `Autocomplete` replaces `NativeSelect`. Both call `useCountries()` — TanStack Query returns the cached result for the second call at zero cost.

### 5.5 Chart

`App.tsx` calls `useSnapshot(countryA)` and `useSnapshot(countryB ?? undefined)`, then passes `snapshotA`, `snapshotB`, `countryA`, `countryB`, and `dailyData` as props to `Chart`.

`Chart.tsx` receives those props directly — it owns no data fetching of its own.

| Condition | Chart type | Data |
|---|---|---|
| No country selected | `LineChart` | Global daily confirmed + deaths |
| One country selected | `BarChart` | Snapshot: 3 bars (infected/recovered/deaths) |
| Two countries selected | `BarChart` | Grouped: 6 bars, 3 per country |

All charts use Recharts `ResponsiveContainer` for responsive width.

Loading state: chart-shaped `Skeleton` (`variant="rectangular"`, fixed height).  
Error state: `Alert severity="error"` with retry.  
No data: `Alert severity="info"` — "No data available for this selection."

---

## 6. Styling

- **MUI owns**: colours, typography, shadows, spacing scale, dark/light palette — all in `theme.ts`.
- **Tailwind owns**: layout utilities on wrapper `div`s (`flex`, `gap-4`, `mt-6`, `max-w-5xl`, `mx-auto`).
- **Tailwind `preflight` disabled** — MUI `CssBaseline` handles resets; both active would conflict.
- **No `.module.css` files** — deleted entirely.
- **Dark mode**: MUI `createTheme({ palette: { mode } })` driven by `ColorModeContext`. Tailwind `darkMode: 'class'` configured but MUI owns all component-level dark colours.

---

## 7. Testing Infrastructure

- `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` as devDependencies.
- `vitest.config.ts`: `environment: 'jsdom'`, `setupFiles: ['src/test/setup.ts']`.
- `src/test/setup.ts`: imports `@testing-library/jest-dom`.
- `src/test/utils.tsx`: exports `renderWithProviders(ui)` — wraps in `QueryClientProvider` + `ThemeProvider`. Eliminates boilerplate when tests are written later.
- `npm test` runs `vitest run` (single pass, no watch).

---

## 8. What's Removed

| Item | Reason |
|---|---|
| `axios` | Native `fetch` is sufficient, removes a dependency |
| `react-chartjs-2` + `chart.js` | Replaced by Recharts |
| `@material-ui/core` (v4) | Replaced by `@mui/material` v6 |
| `classnames` | No longer needed without CSS Modules |
| All `.module.css` files | Replaced by MUI `sx` + Tailwind |
| `react-app-env.d.ts` | CRA-specific, replaced by Vite's `vite-env.d.ts` |
| `reportWebVitals` | CRA-specific, not part of Vite |

`react-countup` is **kept** — still the best way to animate stat numbers.

---

## 9. Implementation notes file

A running `implementation-notes.md` is maintained in the project root throughout the migration, capturing decisions made during implementation that aren't in this spec.

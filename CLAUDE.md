# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start       # dev server at http://localhost:3000
npm run build   # production build
npm test        # run tests in watch mode
npm test -- --watchAll=false  # run tests once (CI mode)
```

## Architecture

This is a Create React App project. State lives entirely in `App.js` as a class component — no Redux or Context. `App` holds `{ data, country }` and passes them down as props.

**Data flow:**
1. `App.componentDidMount` calls `fetchData()` (global stats)
2. `CountryPicker` triggers `handleCountryChange(country)` on selection, which re-fetches with a country filter and updates state
3. `Cards` and `Chart` are stateless receivers of `data` and `country`

**API layer** (`src/api/index.js`) uses [disease.sh](https://disease.sh/) (free, no key required):

| Function | Endpoint |
|---|---|
| `fetchData(country?)` | `GET https://disease.sh/v3/covid-19/all` or `/countries/{country}` |
| `fetchDailyData()` | `GET https://disease.sh/v3/covid-19/historical/all?lastdays=all` |
| `fetchCountries()` | `GET https://disease.sh/v3/covid-19/countries` |

**Response shapes (disease.sh):**
- `fetchData`: returns `{ confirmed, recovered, deaths, lastUpdate }` — all flat numbers (no `.value` nesting). `lastUpdate` is a Unix ms timestamp.
- `fetchDailyData`: disease.sh returns `{ cases: {"1/22/20": N, ...}, deaths: {...} }` — converted via `Object.entries()` to `[{ confirmed, deaths, date }]`.
- `fetchCountries`: extracts `.country` string from each item in the array response.

**Chart behavior** (`Chart.jsx`): renders a `Line` chart (global daily history) when no country is selected, and a `Bar` chart (current snapshot) when a country is chosen. Daily data is fetched once on mount and never re-fetched.

**Styling:** each component has a co-located `.module.css` file. `classnames` (`cx`) is used for conditional class merging in `Cards.jsx`.

**Component barrel:** `src/components/index.js` re-exports all three components so `App.js` imports from `'./components'`.

## Known Issues

- `CountryPicker.jsx`: `setFetchedCountries` in the `useEffect` dependency array is unnecessary (stable setter reference) but harmless.

# COVID-19 Tracker — Vite Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the CRA COVID-19 tracker in-place to Vite + TypeScript + TanStack Query + MUI v6 + Tailwind + Recharts, adding dark mode, country comparison, proper error/loading states, and Vitest test infrastructure.

**Architecture:** Class component `App` → function components throughout; data fetching moves from `useEffect`+`setState` into TanStack Query hooks; styling moves from CSS Modules to MUI `sx` + Tailwind utilities on wrappers.

**Tech Stack:** Vite 5, TypeScript 5, React 18, TanStack Query v5, MUI v6 (Emotion), Tailwind CSS 3 (preflight disabled), Recharts 2, react-countup 6, Vitest 2, Testing Library

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `implementation-notes.md` | Running decision log |
| Replace | `package.json` | CRA → Vite deps |
| Create | `vite.config.ts` | Vite + React plugin |
| Create | `tsconfig.json` | TypeScript settings |
| Create | `tsconfig.node.json` | TypeScript for vite.config |
| Create | `tailwind.config.js` | Tailwind (preflight off) |
| Create | `postcss.config.js` | PostCSS pipeline |
| Create | `index.html` | Vite root entry (replaces public/index.html) |
| Create | `src/vite-env.d.ts` | Vite client types |
| Create | `src/index.css` | Tailwind directives |
| Create | `src/types/covid.ts` | Shared TS interfaces |
| Create | `src/api/covidApi.ts` | Replaces src/api/index.js |
| Create | `src/hooks/useSnapshot.ts` | TanStack Query: global/country stats |
| Create | `src/hooks/useDailyData.ts` | TanStack Query: historical data |
| Create | `src/hooks/useCountries.ts` | TanStack Query: country list |
| Create | `src/theme/theme.ts` | MUI light/dark themes |
| Create | `src/theme/ThemeContext.tsx` | ColorModeProvider + toggle |
| Create | `vitest.config.ts` | Vitest + jsdom |
| Create | `src/test/setup.ts` | jest-dom import |
| Create | `src/test/utils.tsx` | renderWithProviders helper |
| Create | `src/components/ErrorBoundary.tsx` | App-wide error catch |
| Create | `src/components/Layout.tsx` | AppBar + dark mode toggle |
| Create | `src/components/Cards/StatCard.tsx` | Single stat card |
| Replace | `src/components/Cards/Cards.tsx` | 3-card grid |
| Replace | `src/components/CountryPicker/CountryPicker.tsx` | MUI Autocomplete |
| Replace | `src/components/Chart/Chart.tsx` | Line/Bar/Grouped chart |
| Create | `src/App.tsx` | Root: providers + layout + state |
| Create | `src/main.tsx` | Vite entry point |
| Replace | `src/components/index.ts` | Updated barrel |
| Delete | `src/App.js`, `src/App.module.css`, `src/index.js` | CRA artefacts |
| Delete | `src/api/index.js` | Replaced by covidApi.ts |
| Delete | `src/components/**/*.jsx`, `**/*.module.css` | Replaced by .tsx |
| Delete | `src/components/index.js` | Replaced by index.ts |
| Delete | `public/index.html` | Replaced by root index.html |
| Update | `CLAUDE.md` | Update commands |

---

## Task 1: Create implementation-notes.md

**Files:**
- Create: `implementation-notes.md`

- [ ] **Step 1: Create the file**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add implementation-notes.md
git commit -m "docs: add implementation notes log"
```

> If there is no git repo yet: `git init && git add . && git commit -m "chore: initial CRA snapshot"`

---

## Task 2: Scaffold Vite toolchain

**Files:**
- Replace: `package.json`
- Create: `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/vite-env.d.ts`, `src/index.css`

- [ ] **Step 1: Replace `package.json`**

```json
{
  "name": "covid19-tracker",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@emotion/react": "^11.13.3",
    "@emotion/styled": "^11.13.0",
    "@mui/icons-material": "^6.1.6",
    "@mui/material": "^6.1.6",
    "@tanstack/react-query": "^5.59.0",
    "react": "^18.3.1",
    "react-countup": "^6.5.3",
    "react-dom": "^18.3.1",
    "recharts": "^2.13.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.2",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.9",
    "vitest": "^2.1.3"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: installs without errors (ignore deprecation warnings from transitive deps).

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "tailwind.config.js", "postcss.config.js"]
}
```

- [ ] **Step 6: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 7: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 8: Create root-level `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>COVID-19 Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 10: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 11: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.js postcss.config.js index.html src/vite-env.d.ts src/index.css
git commit -m "chore: scaffold Vite + TypeScript + Tailwind toolchain"
```

---

## Task 3: Type definitions

**Files:**
- Create: `src/types/covid.ts`

- [ ] **Step 1: Create `src/types/covid.ts`**

```ts
export interface CovidSnapshot {
  confirmed: number;
  recovered: number;
  deaths: number;
  lastUpdate: number;
}

export interface DailyPoint {
  date: string;
  confirmed: number;
  deaths: number;
}

export type Country = string;
```

- [ ] **Step 2: Commit**

```bash
git add src/types/covid.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 4: API layer

**Files:**
- Create: `src/api/covidApi.ts`

- [ ] **Step 1: Create `src/api/covidApi.ts`**

```ts
import type { CovidSnapshot, DailyPoint, Country } from '../types/covid';

const BASE = 'https://disease.sh/v3/covid-19';

async function json<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function fetchSnapshot(country?: string): Promise<CovidSnapshot> {
  const endpoint = country ? `${BASE}/countries/${country}` : `${BASE}/all`;
  const data = await json<{ cases: number; recovered: number; deaths: number; updated: number }>(
    endpoint
  );
  return {
    confirmed: data.cases,
    recovered: data.recovered,
    deaths: data.deaths,
    lastUpdate: data.updated,
  };
}

export async function fetchDailyData(): Promise<DailyPoint[]> {
  const data = await json<{ cases: Record<string, number>; deaths: Record<string, number> }>(
    `${BASE}/historical/all?lastdays=all`
  );
  return Object.entries(data.cases).map(([date, cases]) => ({
    date,
    confirmed: cases,
    deaths: data.deaths[date] ?? 0,
  }));
}

export async function fetchCountries(): Promise<Country[]> {
  const data = await json<Array<{ country: string }>>(`${BASE}/countries`);
  return data.map((item) => item.country).sort();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/api/covidApi.ts
git commit -m "feat: add typed API layer using native fetch"
```

---

## Task 5: TanStack Query hooks

**Files:**
- Create: `src/hooks/useSnapshot.ts`, `src/hooks/useDailyData.ts`, `src/hooks/useCountries.ts`

- [ ] **Step 1: Create `src/hooks/useSnapshot.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchSnapshot } from '../api/covidApi';

export function useSnapshot(country?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['snapshot', country ?? ''],
    queryFn: () => fetchSnapshot(country),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
```

- [ ] **Step 2: Create `src/hooks/useDailyData.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchDailyData } from '../api/covidApi';

export function useDailyData() {
  return useQuery({
    queryKey: ['daily'],
    queryFn: fetchDailyData,
    staleTime: 60 * 60 * 1000,
  });
}
```

- [ ] **Step 3: Create `src/hooks/useCountries.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '../api/covidApi';

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: add TanStack Query hooks for snapshot, daily, and countries"
```

---

## Task 6: MUI theme + dark mode

**Files:**
- Create: `src/theme/theme.ts`, `src/theme/ThemeContext.tsx`

- [ ] **Step 1: Create `src/theme/theme.ts`**

```ts
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: { mode: 'light' },
});

export const darkTheme = createTheme({
  palette: { mode: 'dark' },
});
```

- [ ] **Step 2: Create `src/theme/ThemeContext.tsx`**

```tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';

interface ColorModeContextType {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const value = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [mode]
  );

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/theme/
git commit -m "feat: add MUI v6 theme with light/dark mode context"
```

---

## Task 7: Test infrastructure

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`, `src/test/utils.tsx`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
  },
});
```

- [ ] **Step 2: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 3: Create `src/test/utils.tsx`**

```tsx
import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ColorModeProvider } from '../theme/ThemeContext';

function AllProviders({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <ColorModeProvider>{children}</ColorModeProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
```

- [ ] **Step 4: Verify tests run cleanly**

```bash
npm test
```

Expected output contains: `No test files found` or `0 tests passed` — no errors.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts src/test/
git commit -m "chore: add Vitest + Testing Library test infrastructure"
```

---

## Task 8: ErrorBoundary

**Files:**
- Create: `src/components/ErrorBoundary.tsx`

- [ ] **Step 1: Create `src/components/ErrorBoundary.tsx`**

```tsx
import React from 'react';
import { Alert, Button, Box } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return (
        <Box className="p-4">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={this.reset}>
                Retry
              </Button>
            }
          >
            Something went wrong: {this.state.message}
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ErrorBoundary.tsx
git commit -m "feat: add ErrorBoundary component"
```

---

## Task 9: Layout

**Files:**
- Create: `src/components/Layout.tsx`

- [ ] **Step 1: Create `src/components/Layout.tsx`**

```tsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../theme/ThemeContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Box className="min-h-screen">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            COVID-19 Tracker
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            aria-label="toggle dark mode"
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat: add Layout with AppBar and dark mode toggle"
```

---

## Task 10: StatCard + Cards

**Files:**
- Create: `src/components/Cards/StatCard.tsx`
- Create: `src/components/Cards/Cards.tsx`

- [ ] **Step 1: Create `src/components/Cards/StatCard.tsx`**

```tsx
import React from 'react';
import { Card, CardContent, Typography, Skeleton, Alert, Button } from '@mui/material';
import CountUp from 'react-countup';

interface StatCardProps {
  title: string;
  value: number | undefined;
  description: string;
  lastUpdate: number | undefined;
  color: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function StatCard({
  title,
  value,
  description,
  lastUpdate,
  color,
  isLoading,
  isError,
  onRetry,
}: StatCardProps) {
  if (isLoading) {
    return <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />;
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        Failed to load {title.toLowerCase()} data.
      </Alert>
    );
  }

  return (
    <Card sx={{ borderTop: `4px solid ${color}`, height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5">
          <CountUp start={0} end={value ?? 0} duration={2.5} separator="," />
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {lastUpdate ? new Date(lastUpdate).toDateString() : '—'}
        </Typography>
        <Typography variant="body2">{description}</Typography>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create `src/components/Cards/Cards.tsx`**

```tsx
import React from 'react';
import Grid from '@mui/material/Grid2';
import { StatCard } from './StatCard';
import type { CovidSnapshot } from '../../types/covid';

interface CardsProps {
  snapshot: CovidSnapshot | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const CARD_CONFIG = [
  {
    key: 'confirmed' as const,
    title: 'Infected',
    description: 'Number of active cases of COVID-19',
    color: '#1976d2',
  },
  {
    key: 'recovered' as const,
    title: 'Recovered',
    description: 'Number of recoveries from COVID-19',
    color: '#2e7d32',
  },
  {
    key: 'deaths' as const,
    title: 'Deaths',
    description: 'Number of deaths caused by COVID-19',
    color: '#d32f2f',
  },
];

export function Cards({ snapshot, isLoading, isError, onRetry }: CardsProps) {
  return (
    <Grid container spacing={3} className="mb-8">
      {CARD_CONFIG.map(({ key, title, description, color }) => (
        <Grid size={{ xs: 12, md: 4 }} key={key}>
          <StatCard
            title={title}
            value={snapshot?.[key]}
            description={description}
            lastUpdate={snapshot?.lastUpdate}
            color={color}
            isLoading={isLoading}
            isError={isError}
            onRetry={onRetry}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Cards/
git commit -m "feat: add StatCard and Cards components with loading/error states"
```

---

## Task 11: CountryPicker

**Files:**
- Create: `src/components/CountryPicker/CountryPicker.tsx`

- [ ] **Step 1: Create `src/components/CountryPicker/CountryPicker.tsx`**

```tsx
import React from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useCountries } from '../../hooks/useCountries';
import type { Country } from '../../types/covid';

interface CountryPickerProps {
  label: string;
  value: Country | null;
  onChange: (country: Country | null) => void;
}

export function CountryPicker({ label, value, onChange }: CountryPickerProps) {
  const { data: countries = [], isLoading } = useCountries();

  return (
    <Autocomplete
      options={countries}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      loading={isLoading}
      clearOnEscape
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{ minWidth: 240 }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CountryPicker/CountryPicker.tsx
git commit -m "feat: add CountryPicker with MUI Autocomplete"
```

---

## Task 12: Chart

**Files:**
- Create: `src/components/Chart/Chart.tsx`

- [ ] **Step 1: Create `src/components/Chart/Chart.tsx`**

```tsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Skeleton, Alert, Button, Typography } from '@mui/material';
import type { CovidSnapshot, DailyPoint } from '../../types/covid';

interface ChartProps {
  countryA: string;
  countryB: string | null;
  snapshotA: CovidSnapshot | undefined;
  snapshotB: CovidSnapshot | undefined;
  dailyData: DailyPoint[] | undefined;
  isLoadingSnapshot: boolean;
  isLoadingDaily: boolean;
  isErrorSnapshot: boolean;
  isErrorDaily: boolean;
  onRetrySnapshot: () => void;
  onRetryDaily: () => void;
}

function fmt(v: number | string) {
  return typeof v === 'number' ? v.toLocaleString() : v;
}

export function Chart({
  countryA,
  countryB,
  snapshotA,
  snapshotB,
  dailyData,
  isLoadingSnapshot,
  isLoadingDaily,
  isErrorSnapshot,
  isErrorDaily,
  onRetrySnapshot,
  onRetryDaily,
}: ChartProps) {
  const noCountry = !countryA;

  if (noCountry) {
    if (isLoadingDaily) {
      return <Skeleton variant="rectangular" height={400} sx={{ mt: 4 }} />;
    }
    if (isErrorDaily) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onRetryDaily}>
              Retry
            </Button>
          }
        >
          Failed to load daily history.
        </Alert>
      );
    }
    if (!dailyData?.length) {
      return <Alert severity="info">No historical data available.</Alert>;
    }
    return (
      <Box className="mt-8">
        <Typography variant="h6" className="mb-4">
          Global Daily History
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              interval={Math.floor(dailyData.length / 10)}
            />
            <YAxis tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`} />
            <Tooltip formatter={fmt} />
            <Legend />
            <Line
              type="monotone"
              dataKey="confirmed"
              stroke="#1976d2"
              dot={false}
              name="Infected"
            />
            <Line
              type="monotone"
              dataKey="deaths"
              stroke="#d32f2f"
              dot={false}
              name="Deaths"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  if (isLoadingSnapshot) {
    return <Skeleton variant="rectangular" height={400} sx={{ mt: 4 }} />;
  }
  if (isErrorSnapshot) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetrySnapshot}>
            Retry
          </Button>
        }
      >
        Failed to load country snapshot.
      </Alert>
    );
  }
  if (!snapshotA) {
    return <Alert severity="info">No data available for this selection.</Alert>;
  }

  if (countryB && snapshotB) {
    const comparisonData = [
      {
        name: 'Infected',
        [countryA]: snapshotA.confirmed,
        [countryB]: snapshotB.confirmed,
      },
      {
        name: 'Recovered',
        [countryA]: snapshotA.recovered,
        [countryB]: snapshotB.recovered,
      },
      {
        name: 'Deaths',
        [countryA]: snapshotA.deaths,
        [countryB]: snapshotB.deaths,
      },
    ];
    return (
      <Box className="mt-8">
        <Typography variant="h6" className="mb-4">
          {countryA} vs {countryB}
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={fmt} />
            <Tooltip formatter={fmt} />
            <Legend />
            <Bar dataKey={countryA} fill="#1976d2" />
            <Bar dataKey={countryB} fill="#ed6c02" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  const barData = [
    { name: 'Infected', value: snapshotA.confirmed },
    { name: 'Recovered', value: snapshotA.recovered },
    { name: 'Deaths', value: snapshotA.deaths },
  ];
  return (
    <Box className="mt-8">
      <Typography variant="h6" className="mb-4">
        Current data in {countryA}
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={fmt} />
          <Tooltip formatter={fmt} />
          <Bar dataKey="value" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Chart/Chart.tsx
git commit -m "feat: add Chart with Line/Bar/grouped-comparison via Recharts"
```

---

## Task 13: App + entry point

**Files:**
- Create: `src/App.tsx`, `src/main.tsx`
- Create: `src/components/index.ts`

- [ ] **Step 1: Create `src/App.tsx`**

```tsx
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ColorModeProvider } from './theme/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Cards } from './components/Cards/Cards';
import { Chart } from './components/Chart/Chart';
import { CountryPicker } from './components/CountryPicker/CountryPicker';
import { useSnapshot } from './hooks/useSnapshot';
import { useDailyData } from './hooks/useDailyData';
import type { Country } from './types/covid';

const queryClient = new QueryClient();

function TrackerContent() {
  const [countryA, setCountryA] = useState<Country | null>(null);
  const [countryB, setCountryB] = useState<Country | null>(null);

  const snapshotAQuery = useSnapshot(countryA ?? undefined);
  const snapshotBQuery = useSnapshot(countryB ?? undefined, { enabled: !!countryB });
  const dailyQuery = useDailyData();

  return (
    <>
      <Cards
        snapshot={snapshotAQuery.data}
        isLoading={snapshotAQuery.isLoading}
        isError={snapshotAQuery.isError}
        onRetry={() => { void snapshotAQuery.refetch(); }}
      />
      <div className="flex gap-4 mb-8 flex-wrap">
        <CountryPicker label="Country" value={countryA} onChange={setCountryA} />
        <CountryPicker label="Compare with…" value={countryB} onChange={setCountryB} />
      </div>
      <Chart
        countryA={countryA ?? ''}
        countryB={countryB}
        snapshotA={snapshotAQuery.data}
        snapshotB={snapshotBQuery.data}
        dailyData={dailyQuery.data}
        isLoadingSnapshot={
          snapshotAQuery.isLoading || (!!countryB && snapshotBQuery.isLoading)
        }
        isLoadingDaily={dailyQuery.isLoading}
        isErrorSnapshot={
          snapshotAQuery.isError || (!!countryB && snapshotBQuery.isError)
        }
        isErrorDaily={dailyQuery.isError}
        onRetrySnapshot={() => {
          void snapshotAQuery.refetch();
          void snapshotBQuery.refetch();
        }}
        onRetryDaily={() => { void dailyQuery.refetch(); }}
      />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeProvider>
        <ErrorBoundary>
          <Layout>
            <TrackerContent />
          </Layout>
        </ErrorBoundary>
      </ColorModeProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Create `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: Create `src/components/index.ts`**

```ts
export { Cards } from './Cards/Cards';
export { Chart } from './Chart/Chart';
export { CountryPicker } from './CountryPicker/CountryPicker';
export { ErrorBoundary } from './ErrorBoundary';
export { Layout } from './Layout';
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/main.tsx src/components/index.ts
git commit -m "feat: wire up App with all providers and state"
```

---

## Task 14: Cleanup old files

**Files:**
- Delete: all old CRA JS/JSX/module.css files listed below

- [ ] **Step 1: Delete old source files**

On Windows PowerShell:
```powershell
Remove-Item src/App.js, src/App.module.css, src/index.js -ErrorAction SilentlyContinue
Remove-Item src/api/index.js -ErrorAction SilentlyContinue
Remove-Item src/components/index.js -ErrorAction SilentlyContinue
Remove-Item src/components/Cards/Cards.jsx, src/components/Cards/Cards.module.css -ErrorAction SilentlyContinue
Remove-Item src/components/Chart/Chart.jsx, "src/components/Chart/Charts.module.css" -ErrorAction SilentlyContinue
Remove-Item src/components/CountryPicker/CountryPicker.jsx, src/components/CountryPicker/CountryPicker.module.css -ErrorAction SilentlyContinue
Remove-Item public/index.html -ErrorAction SilentlyContinue
```

- [ ] **Step 2: Run typecheck to confirm no dangling imports**

```bash
npm run typecheck
```

Expected: 0 errors. If there are errors, fix the import before continuing.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove CRA source files and CSS modules"
```

---

## Task 15: Verify + update CLAUDE.md

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Expected: `Local: http://localhost:5173/` — open in browser and confirm:
- Global stats cards load with CountUp animation
- Line chart appears showing global history
- Country picker works — selecting a country swaps to a bar chart
- Comparison picker appears — selecting a second country shows grouped bars
- Dark mode toggle switches the palette
- Skeleton loaders appear briefly on first load
- No console errors

- [ ] **Step 2: Update `CLAUDE.md` commands section**

Replace the Commands section with:

```markdown
## Commands

\`\`\`bash
npm run dev     # dev server at http://localhost:5173
npm run build   # production build (runs tsc first)
npm run preview # preview production build locally
npm test        # run Vitest once (CI mode)
npm run test:watch  # run Vitest in watch mode
npm run typecheck   # TypeScript check without emitting
\`\`\`
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with Vite commands"
```

---

## Self-review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Vite bundler | Task 2 |
| TypeScript | Task 2 (tsconfig) + Task 3 (types) |
| TanStack Query | Task 5 |
| MUI v6 | Task 6 + all component tasks |
| Tailwind (preflight off) | Task 2 |
| Recharts | Task 12 |
| Dark mode toggle | Task 6 + Task 9 |
| Country comparison (grouped bar) | Task 12 + Task 13 |
| Error states (Alert + retry) | Task 8 + Tasks 10/12 |
| Loading states (Skeleton) | Tasks 10/12 |
| Vitest + RTL infrastructure | Task 7 |
| `renderWithProviders` helper | Task 7 |
| Remove axios | Task 4 (native fetch) |
| implementation-notes.md | Task 1 |
| CLAUDE.md updated | Task 15 |

**Placeholder scan:** No TBDs, no vague steps. All code blocks are complete.

**Type consistency:**
- `CovidSnapshot` defined in Task 3, used in Tasks 10, 12, 13 ✓
- `DailyPoint` defined in Task 3, used in Task 12 ✓
- `Country` type alias defined in Task 3, used in Tasks 11, 13 ✓
- `useSnapshot(country?, options?)` defined in Task 5, called with `{ enabled: !!countryB }` in Task 13 ✓
- `CountryPicker` props `{ label, value, onChange }` defined in Task 11, used in Task 13 ✓
- `Cards` props `{ snapshot, isLoading, isError, onRetry }` defined in Task 10, used in Task 13 ✓
- `Chart` props defined in Task 12, called correctly in Task 13 ✓

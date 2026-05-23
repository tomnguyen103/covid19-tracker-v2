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

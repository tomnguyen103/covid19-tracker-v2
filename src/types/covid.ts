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

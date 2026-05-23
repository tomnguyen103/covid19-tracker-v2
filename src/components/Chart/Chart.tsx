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

function compact(v: number | string) {
  if (typeof v !== 'number') return v;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
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
          <LineChart data={dailyData} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              interval={Math.floor(dailyData.length / 10)}
            />
            <YAxis tickFormatter={compact} />
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
          <BarChart data={comparisonData} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={compact} />
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
        <BarChart data={barData} margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={compact} />
          <Tooltip formatter={fmt} />
          <Bar dataKey="value" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

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

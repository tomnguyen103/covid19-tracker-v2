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

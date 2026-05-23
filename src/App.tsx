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

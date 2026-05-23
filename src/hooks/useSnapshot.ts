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

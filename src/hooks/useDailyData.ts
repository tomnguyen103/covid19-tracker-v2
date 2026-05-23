import { useQuery } from '@tanstack/react-query';
import { fetchDailyData } from '../api/covidApi';

export function useDailyData() {
  return useQuery({
    queryKey: ['daily'],
    queryFn: fetchDailyData,
    staleTime: 60 * 60 * 1000,
  });
}

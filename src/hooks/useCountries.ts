import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '../api/covidApi';

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

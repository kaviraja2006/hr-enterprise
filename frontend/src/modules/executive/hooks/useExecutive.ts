import { useQuery } from '@tanstack/react-query';
import { executiveApi } from '../services/executive.api';

export function useExecutiveSummary() {
  return useQuery({
    queryKey: ['executive-summary'],
    queryFn: executiveApi.getExecutiveSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
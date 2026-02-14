import { apiClient } from '../../../core/api/api-client';
import type { ExecutiveSummary } from '../types';

export const executiveApi = {
  getExecutiveSummary: async (): Promise<ExecutiveSummary> => {
    return apiClient.get<ExecutiveSummary>('/analytics/executive-summary');
  },
};
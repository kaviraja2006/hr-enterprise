import api from '../../../core/api/axios';
import type {
  Goal,
  PerformanceReview,
  PerformanceSummary,
  PerformanceStats,
  CreateGoalDto,
  CreatePerformanceReviewDto,
} from '../types';

interface ListParams {
  employeeId?: string;
  status?: string;
  skip?: number;
  take?: number;
}

interface ListResponse<T> {
  data: T[];
  total: number;
}

export const performanceApi = {
  // Goals
  getGoals: async (params?: ListParams): Promise<ListResponse<Goal>> => {
    const response = await api.get<ListResponse<Goal>>('/performance/goals', { params });
    return response.data;
  },

  getGoal: async (id: string): Promise<Goal> => {
    const response = await api.get<Goal>(`/performance/goals/${id}`);
    return response.data;
  },

  createGoal: async (data: CreateGoalDto): Promise<Goal> => {
    const response = await api.post<Goal>('/performance/goals', data);
    return response.data;
  },

  updateGoalProgress: async (id: string, achievedValue: number): Promise<Goal> => {
    const response = await api.patch<Goal>(`/performance/goals/${id}/progress`, { achievedValue });
    return response.data;
  },

  updateGoalStatus: async (id: string, status: string): Promise<Goal> => {
    const response = await api.patch<Goal>(`/performance/goals/${id}/status`, { status });
    return response.data;
  },

  deleteGoal: async (id: string): Promise<void> => {
    await api.delete(`/performance/goals/${id}`);
  },

  // Performance Reviews
  getReviews: async (params?: ListParams & { reviewerId?: string }): Promise<ListResponse<PerformanceReview>> => {
    const response = await api.get<ListResponse<PerformanceReview>>('/performance/reviews', { params });
    return response.data;
  },

  getReview: async (id: string): Promise<PerformanceReview> => {
    const response = await api.get<PerformanceReview>(`/performance/reviews/${id}`);
    return response.data;
  },

  createReview: async (data: CreatePerformanceReviewDto): Promise<PerformanceReview> => {
    const response = await api.post<PerformanceReview>('/performance/reviews', data);
    return response.data;
  },

  submitReview: async (id: string): Promise<PerformanceReview> => {
    const response = await api.post<PerformanceReview>(`/performance/reviews/${id}/submit`);
    return response.data;
  },

  acknowledgeReview: async (id: string): Promise<PerformanceReview> => {
    const response = await api.post<PerformanceReview>(`/performance/reviews/${id}/acknowledge`);
    return response.data;
  },

  // Summary & Stats
  getEmployeeSummary: async (employeeId: string): Promise<PerformanceSummary> => {
    const response = await api.get<PerformanceSummary>(`/performance/summary/${employeeId}`);
    return response.data;
  },

  getStats: async (): Promise<PerformanceStats> => {
    const response = await api.get<PerformanceStats>('/performance/stats');
    return response.data;
  },
};

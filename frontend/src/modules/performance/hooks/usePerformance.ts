import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from '../services/performance.api';
import type {
  CreateGoalDto,
  CreatePerformanceReviewDto,
} from '../types';

// Query keys
export const performanceKeys = {
  all: ['performance'] as const,
  goals: () => [...performanceKeys.all, 'goals'] as const,
  goal: (id: string) => [...performanceKeys.goals(), id] as const,
  reviews: () => [...performanceKeys.all, 'reviews'] as const,
  review: (id: string) => [...performanceKeys.reviews(), id] as const,
  summary: (employeeId: string) => [...performanceKeys.all, 'summary', employeeId] as const,
  stats: () => [...performanceKeys.all, 'stats'] as const,
};

// Goal hooks
export function useGoals(params?: { employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: [...performanceKeys.goals(), params],
    queryFn: () => performanceApi.getGoals(params),
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: performanceKeys.goal(id),
    queryFn: () => performanceApi.getGoal(id),
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalDto) => performanceApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.stats() });
    },
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, achievedValue }: { id: string; achievedValue: number }) =>
      performanceApi.updateGoalProgress(id, achievedValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.stats() });
    },
  });
}

export function useUpdateGoalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      performanceApi.updateGoalStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.stats() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.stats() });
    },
  });
}

// Performance Review hooks
export function useReviews(params?: { employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: [...performanceKeys.reviews(), params],
    queryFn: () => performanceApi.getReviews(params),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: performanceKeys.review(id),
    queryFn: () => performanceApi.getReview(id),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePerformanceReviewDto) => performanceApi.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.stats() });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.submitReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.review(id) });
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
    },
  });
}

export function useAcknowledgeReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => performanceApi.acknowledgeReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.review(id) });
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
    },
  });
}

// Summary & Stats hooks
export function useEmployeeSummary(employeeId: string) {
  return useQuery({
    queryKey: performanceKeys.summary(employeeId),
    queryFn: () => performanceApi.getEmployeeSummary(employeeId),
    enabled: !!employeeId,
  });
}

export function usePerformanceStats() {
  return useQuery({
    queryKey: performanceKeys.stats(),
    queryFn: () => performanceApi.getStats(),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflow.api';
import type {
  CreateApprovalDto,
  ApproveStepDto,
  RejectApprovalDto,
  ApprovalStatus,
} from '../types';

// Query keys
export const workflowKeys = {
  all: ['workflow'] as const,
  approvals: () => [...workflowKeys.all, 'approvals'] as const,
  list: (params?: Record<string, unknown>) => [...workflowKeys.approvals(), 'list', params] as const,
  detail: (id: string) => [...workflowKeys.approvals(), id] as const,
  pending: () => [...workflowKeys.approvals(), 'pending'] as const,
  history: (entityType: string, entityId: string) =>
    [...workflowKeys.all, 'history', entityType, entityId] as const,
  stats: () => [...workflowKeys.all, 'stats'] as const,
};

// Approval hooks
export function useApprovals(params?: {
  requesterId?: string;
  approverId?: string;
  status?: ApprovalStatus;
  entityType?: string;
}) {
  return useQuery({
    queryKey: workflowKeys.list(params),
    queryFn: () => workflowApi.getApprovals(params),
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: workflowKeys.pending(),
    queryFn: () => workflowApi.getPendingApprovals(),
  });
}

export function useApproval(id: string) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => workflowApi.getApproval(id),
    enabled: !!id,
  });
}

export function useCreateApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApprovalDto) => workflowApi.createApproval(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.approvals() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.stats() });
    },
  });
}

export function useApproveStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveStepDto }) =>
      workflowApi.approveStep(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.approvals() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.pending() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.stats() });
    },
  });
}

export function useRejectApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectApprovalDto }) =>
      workflowApi.rejectApproval(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.approvals() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.pending() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.stats() });
    },
  });
}

// History hook
export function useApprovalHistory(entityType: string, entityId: string) {
  return useQuery({
    queryKey: workflowKeys.history(entityType, entityId),
    queryFn: () => workflowApi.getApprovalHistory(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

// Stats hook
export function useApprovalStats() {
  return useQuery({
    queryKey: workflowKeys.stats(),
    queryFn: () => workflowApi.getApprovalStats(),
  });
}

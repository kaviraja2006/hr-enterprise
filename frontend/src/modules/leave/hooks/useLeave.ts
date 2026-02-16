import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../services/leave.api';
import type {
  LeaveListParams,
  CreateLeaveRequestDto,
  ApproveLeaveDto,
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
} from '../types';

// Query keys
export const leaveKeys = {
  all: ['leave'] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  type: (id: string) => [...leaveKeys.types(), id] as const,
  requests: () => [...leaveKeys.all, 'requests'] as const,
  list: (params: LeaveListParams) => [...leaveKeys.requests(), 'list', params] as const,
  myRequests: (params?: LeaveListParams) => [...leaveKeys.requests(), 'my', params] as const,
  detail: (id: string) => [...leaveKeys.requests(), id] as const,
  balance: (year?: number) => [...leaveKeys.all, 'balance', year] as const,
  summary: (year?: number) => [...leaveKeys.all, 'summary', year] as const,
};

// Leave Types hooks
export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: () => leaveApi.getLeaveTypes(),
  });
}

export function useLeaveType(id: string) {
  return useQuery({
    queryKey: leaveKeys.type(id),
    queryFn: () => leaveApi.getLeaveType(id),
    enabled: !!id,
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveTypeDto) => leaveApi.createLeaveType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types() });
    },
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveTypeDto }) =>
      leaveApi.updateLeaveType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types() });
    },
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveApi.deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types() });
    },
  });
}

// Leave Requests hooks
export function useLeaveRequests(params: LeaveListParams = {}) {
  return useQuery({
    queryKey: leaveKeys.list(params),
    queryFn: () => leaveApi.getLeaveRequests(params),
  });
}

export function useMyLeaveRequests(params?: LeaveListParams) {
  return useQuery({
    queryKey: leaveKeys.myRequests(params),
    queryFn: () => leaveApi.getMyLeaveRequests(params),
  });
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: leaveKeys.detail(id),
    queryFn: () => leaveApi.getLeaveRequest(id),
    enabled: !!id,
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestDto) => leaveApi.createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.summary() });
    },
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveApi.approveLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance() });
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveLeaveDto }) =>
      leaveApi.rejectLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
    },
  });
}

export function useCancelLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveApi.cancelLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance() });
    },
  });
}

// Leave Balance & Summary hooks
export function useLeaveBalance(year?: number) {
  return useQuery({
    queryKey: leaveKeys.balance(year),
    queryFn: () => leaveApi.getLeaveBalance(year),
  });
}

export function useLeaveSummary(year?: number) {
  return useQuery({
    queryKey: leaveKeys.summary(year),
    queryFn: () => leaveApi.getLeaveSummary(year),
  });
}

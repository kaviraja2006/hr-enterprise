import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeaveRequests,
  fetchLeaveRequestsByEmployee,
  fetchPendingLeaveRequests,
  fetchLeaveRequestById,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  fetchLeaveSummary,
} from '@/api/leave-requests';
import type { CreateLeaveRequestInput } from '@/types';

export const useLeaveRequests = () =>
  useQuery({
    queryKey: ['leave-requests'],
    queryFn: fetchLeaveRequests,
  });

export const useLeaveRequestsByEmployee = (employeeId: string) =>
  useQuery({
    queryKey: ['leave-requests', 'employee', employeeId],
    queryFn: () => fetchLeaveRequestsByEmployee(employeeId),
    enabled: !!employeeId,
  });

export const usePendingLeaveRequests = () =>
  useQuery({
    queryKey: ['leave-requests', 'pending'],
    queryFn: fetchPendingLeaveRequests,
  });

export const useLeaveRequest = (id: string) =>
  useQuery({
    queryKey: ['leave-requests', id],
    queryFn: () => fetchLeaveRequestById(id),
    enabled: !!id,
  });

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
  });
};

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests', 'pending'] });
    },
  });
};

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests', 'pending'] });
    },
  });
};

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
  });
};

export const useLeaveSummary = (employeeId: string, year: number) =>
  useQuery({
    queryKey: ['leave-summary', employeeId, year],
    queryFn: () => fetchLeaveSummary(employeeId, year),
    enabled: !!employeeId,
  });

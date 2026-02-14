import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../services/attendance.api';
import type {
  AttendanceListParams,
  CheckInDto,
  CheckOutDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from '../types';

// Query keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params: AttendanceListParams) => [...attendanceKeys.lists(), params] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
  summary: (employeeId: string) => [...attendanceKeys.all, 'summary', employeeId] as const,
  todayStats: () => [...attendanceKeys.all, 'todayStats'] as const,
  myAttendance: () => [...attendanceKeys.all, 'my'] as const,
};

// List attendance records hook
export function useAttendance(params: AttendanceListParams = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.list(params),
  });
}

// Get single attendance record hook
export function useAttendanceRecord(id: string) {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => attendanceApi.get(id),
    enabled: !!id,
  });
}

// Get attendance summary hook
export function useAttendanceSummary(employeeId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...attendanceKeys.summary(employeeId), { startDate, endDate }],
    queryFn: () => attendanceApi.getSummary(employeeId, { startDate, endDate }),
    enabled: !!employeeId,
  });
}

// Get today's stats hook
export function useTodayAttendanceStats() {
  return useQuery({
    queryKey: attendanceKeys.todayStats(),
    queryFn: () => attendanceApi.getTodayStats(),
  });
}

// Get my attendance hook
export function useMyAttendance(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...attendanceKeys.myAttendance(), { startDate, endDate }],
    queryFn: () => attendanceApi.getMyAttendance({ startDate, endDate }),
  });
}

// Check in hook
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInDto) => attendanceApi.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.todayStats() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.myAttendance() });
    },
  });
}

// Check out hook
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckOutDto) => attendanceApi.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.todayStats() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.myAttendance() });
    },
  });
}

// Create attendance record hook
export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceDto) => attendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.todayStats() });
    },
  });
}

// Update attendance record hook
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceDto }) =>
      attendanceApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
    },
  });
}

// Delete attendance record hook
export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.todayStats() });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/analytics.api';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  executive: () => [...analyticsKeys.all, 'executive'] as const,
  attendance: () => [...analyticsKeys.all, 'attendance'] as const,
  attendanceMetrics: (params: { startDate: string; endDate: string; departmentId?: string }) =>
    [...analyticsKeys.attendance(), 'metrics', params] as const,
  leave: () => [...analyticsKeys.all, 'leave'] as const,
  leaveMetrics: (params: { year: number; departmentId?: string }) =>
    [...analyticsKeys.leave(), 'metrics', params] as const,
  payroll: () => [...analyticsKeys.all, 'payroll'] as const,
  payrollMetrics: (year: number) => [...analyticsKeys.payroll(), 'metrics', year] as const,
  attrition: (year: number) => [...analyticsKeys.all, 'attrition', year] as const,
  departments: () => [...analyticsKeys.all, 'departments'] as const,
};

// Executive Summary hook
export function useExecutiveSummary() {
  return useQuery({
    queryKey: analyticsKeys.executive(),
    queryFn: () => analyticsApi.getExecutiveSummary(),
  });
}

// Attendance hooks
export function useTodayAttendance() {
  return useQuery({
    queryKey: [...analyticsKeys.attendance(), 'today'],
    queryFn: () => analyticsApi.getTodayAttendance(),
  });
}

export function useAttendanceMetrics(params: {
  startDate: string;
  endDate: string;
  departmentId?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.attendanceMetrics(params),
    queryFn: () => analyticsApi.getAttendanceMetrics(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

// Leave hooks
export function useLeaveMetrics(params: { year: number; departmentId?: string }) {
  return useQuery({
    queryKey: analyticsKeys.leaveMetrics(params),
    queryFn: () => analyticsApi.getLeaveMetrics(params),
    enabled: !!params.year,
  });
}

// Payroll hooks
export function usePayrollMetrics(year: number) {
  return useQuery({
    queryKey: analyticsKeys.payrollMetrics(year),
    queryFn: () => analyticsApi.getPayrollMetrics({ year }),
    enabled: !!year,
  });
}

// Attrition hooks
export function useAttritionData(year: number) {
  return useQuery({
    queryKey: analyticsKeys.attrition(year),
    queryFn: () => analyticsApi.getAttritionRate({ year }),
    enabled: !!year,
  });
}

// Department hooks
export function useDepartmentMetrics() {
  return useQuery({
    queryKey: analyticsKeys.departments(),
    queryFn: () => analyticsApi.getDepartmentMetrics(),
  });
}

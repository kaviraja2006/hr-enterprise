import api from '../../../core/api/axios';
import type {
  ExecutiveSummary,
  AttendanceMetrics,
  LeaveMetrics,
  PayrollMetrics,
  AttritionData,
  DepartmentMetrics,
  TodayAttendance,
} from '../types';

export const analyticsApi = {
  // Executive Summary
  getExecutiveSummary: async (): Promise<ExecutiveSummary> => {
    const response = await api.get<ExecutiveSummary>('/analytics/executive-summary');
    return response.data;
  },

  // Attendance Analytics
  getTodayAttendance: async (): Promise<TodayAttendance> => {
    const response = await api.get<TodayAttendance>('/analytics/attendance/today');
    return response.data;
  },

  getAttendanceMetrics: async (params: {
    startDate: string;
    endDate: string;
    departmentId?: string;
  }): Promise<AttendanceMetrics> => {
    const response = await api.get<AttendanceMetrics>('/analytics/attendance/metrics', { params });
    return response.data;
  },

  // Leave Analytics
  getLeaveMetrics: async (params: {
    year: number;
    departmentId?: string;
  }): Promise<LeaveMetrics> => {
    const response = await api.get<LeaveMetrics>('/analytics/leave/metrics', { params });
    return response.data;
  },

  // Payroll Analytics
  getPayrollMetrics: async (params: {
    year: number;
  }): Promise<PayrollMetrics> => {
    const response = await api.get<PayrollMetrics>('/analytics/payroll/metrics', { params });
    return response.data;
  },

  // Attrition Analytics
  getAttritionRate: async (params: {
    year: number;
  }): Promise<AttritionData> => {
    const response = await api.get<AttritionData>('/analytics/attrition', { params });
    return response.data;
  },

  // Department Analytics
  getDepartmentMetrics: async (): Promise<DepartmentMetrics> => {
    const response = await api.get<DepartmentMetrics>('/analytics/departments');
    return response.data;
  },
};

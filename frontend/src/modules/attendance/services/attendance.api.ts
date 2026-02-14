import api from '../../../core/api/axios';
import type {
  Attendance,
  AttendanceListParams,
  AttendanceListResponse,
  CheckInDto,
  CheckOutDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceSummary,
  TodayAttendanceStats,
} from '../types';

export const attendanceApi = {
  // List attendance records with pagination and filters
  list: async (params: AttendanceListParams): Promise<AttendanceListResponse> => {
    const response = await api.get<AttendanceListResponse>('/attendance', { params });
    return response.data;
  },

  // Get single attendance record
  get: async (id: string): Promise<Attendance> => {
    const response = await api.get<Attendance>(`/attendance/${id}`);
    return response.data;
  },

  // Check in
  checkIn: async (data: CheckInDto): Promise<Attendance> => {
    const response = await api.post<Attendance>('/attendance/check-in', data);
    return response.data;
  },

  // Check out
  checkOut: async (data: CheckOutDto): Promise<Attendance> => {
    const response = await api.post<Attendance>('/attendance/check-out', data);
    return response.data;
  },

  // Create attendance record (admin)
  create: async (data: CreateAttendanceDto): Promise<Attendance> => {
    const response = await api.post<Attendance>('/attendance', data);
    return response.data;
  },

  // Update attendance record
  update: async (id: string, data: UpdateAttendanceDto): Promise<Attendance> => {
    const response = await api.patch<Attendance>(`/attendance/${id}`, data);
    return response.data;
  },

  // Delete attendance record
  delete: async (id: string): Promise<void> => {
    await api.delete(`/attendance/${id}`);
  },

  // Get attendance summary for an employee
  getSummary: async (employeeId: string, params?: { startDate?: string; endDate?: string }): Promise<AttendanceSummary> => {
    const response = await api.get<AttendanceSummary>(`/attendance/summary/${employeeId}`, { params });
    return response.data;
  },

  // Get today's attendance stats
  getTodayStats: async (): Promise<TodayAttendanceStats> => {
    const response = await api.get<TodayAttendanceStats>('/attendance/today-stats');
    return response.data;
  },

  // Get my attendance (for logged-in employee)
  getMyAttendance: async (params?: { startDate?: string; endDate?: string }): Promise<Attendance[]> => {
    const response = await api.get<Attendance[]>('/attendance/my', { params });
    return response.data;
  },

  // Export attendance to CSV
  exportCsv: async (params?: AttendanceListParams): Promise<Blob> => {
    const response = await api.get('/attendance/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

import api from '../../../core/api/axios';
import type {
  LeaveRequest,
  LeaveType,
  LeaveBalance,
  LeaveListParams,
  LeaveListResponse,
  CreateLeaveRequestDto,
  ApproveLeaveDto,
  LeaveSummary,
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
} from '../types';

export const leaveApi = {
  // Leave Types
  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await api.get<LeaveType[]>('/leave-types');
    return response.data;
  },

  getLeaveType: async (id: string): Promise<LeaveType> => {
    const response = await api.get<LeaveType>(`/leave-types/${id}`);
    return response.data;
  },

  createLeaveType: async (data: CreateLeaveTypeDto): Promise<LeaveType> => {
    const response = await api.post<LeaveType>('/leave-types', data);
    return response.data;
  },

  updateLeaveType: async (id: string, data: UpdateLeaveTypeDto): Promise<LeaveType> => {
    const response = await api.patch<LeaveType>(`/leave-types/${id}`, data);
    return response.data;
  },

  deleteLeaveType: async (id: string): Promise<void> => {
    await api.delete(`/leave-types/${id}`);
  },

  // Leave Requests
  getLeaveRequests: async (params: LeaveListParams): Promise<LeaveListResponse> => {
    const response = await api.get<LeaveListResponse>('/leave-requests', { params });
    return response.data;
  },

  getMyLeaveRequests: async (params?: LeaveListParams): Promise<LeaveListResponse> => {
    const response = await api.get<LeaveListResponse>('/leave-requests/my-requests', { params });
    return response.data;
  },

  getLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.get<LeaveRequest>(`/leave-requests/${id}`);
    return response.data;
  },

  createLeaveRequest: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>('/leave-requests', data);
    return response.data;
  },

  approveLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.patch<LeaveRequest>(`/leave-requests/${id}/approve`);
    return response.data;
  },

  rejectLeaveRequest: async (id: string, data: ApproveLeaveDto): Promise<LeaveRequest> => {
    const response = await api.patch<LeaveRequest>(`/leave-requests/${id}/reject`, data);
    return response.data;
  },

  cancelLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.patch<LeaveRequest>(`/leave-requests/${id}/cancel`);
    return response.data;
  },

  // Leave Balance & Summary
  getLeaveBalance: async (year?: number): Promise<LeaveBalance[]> => {
    const response = await api.get<LeaveBalance[]>('/leave-requests/balance', {
      params: { year },
    });
    return response.data;
  },

  getLeaveSummary: async (year?: number): Promise<LeaveSummary> => {
    const response = await api.get<LeaveSummary>('/leave-requests/summary', {
      params: { year },
    });
    return response.data;
  },
};

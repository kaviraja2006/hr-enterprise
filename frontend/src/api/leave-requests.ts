import { api } from './client';
import type { LeaveRequest, CreateLeaveRequestInput, LeaveSummary } from '@/types';

export const fetchLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const { data } = await api.get('/leave-requests');
  return data;
};

export const fetchLeaveRequestsByEmployee = async (employeeId: string): Promise<LeaveRequest[]> => {
  const { data } = await api.get(`/leave-requests/employee/${employeeId}`);
  return data;
};

export const fetchPendingLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const { data } = await api.get('/leave-requests/pending');
  return data;
};

export const fetchLeaveRequestById = async (id: string): Promise<LeaveRequest> => {
  const { data } = await api.get(`/leave-requests/${id}`);
  return data;
};

export const createLeaveRequest = async (payload: CreateLeaveRequestInput): Promise<LeaveRequest> => {
  const { data } = await api.post('/leave-requests', payload);
  return data;
};

export const approveLeaveRequest = async (id: string): Promise<void> => {
  await api.post(`/leave-requests/${id}/approve`, {});
};

export const rejectLeaveRequest = async (id: string): Promise<void> => {
  await api.post(`/leave-requests/${id}/reject`, {});
};

export const cancelLeaveRequest = async (id: string): Promise<void> => {
  await api.post(`/leave-requests/${id}/cancel`, {});
};

export const fetchLeaveSummary = async (employeeId: string, year: number): Promise<LeaveSummary> => {
  const { data } = await api.get(`/leave-requests/summary/${employeeId}?year=${year}`);
  return data;
};

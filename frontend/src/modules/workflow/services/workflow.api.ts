import { apiClient } from '../../../core/api/api-client';
import type { Approval } from '../types';

export interface ApprovalStats {
  pendingForMe: number;
  myRequestsPending: number;
  totalApproved: number;
  totalRejected: number;
  pendingTrend?: { value: number; isPositive: boolean };
  requestsTrend?: { value: number; isPositive: boolean };
  approvalRate?: number;
  rejectionRate?: number;
}

export const workflowApi = {
  getApprovals: (): Promise<Approval[]> => {
    return apiClient.get<Approval[]>('/workflow/approvals');
  },

  getPendingApprovals: (): Promise<Approval[]> => {
    return apiClient.get<Approval[]>('/workflow/approvals/pending');
  },

  getApprovalStats: (): Promise<ApprovalStats> => {
    return apiClient.get<ApprovalStats>('/workflow/approvals/stats');
  },

  approveStep: (id: string, comments?: string): Promise<Approval> => {
    return apiClient.post<Approval>(`/workflow/approvals/${id}/approve`, { comments });
  },

  rejectStep: (id: string, comments: string): Promise<Approval> => {
    return apiClient.post<Approval>(`/workflow/approvals/${id}/reject`, { comments });
  },
};

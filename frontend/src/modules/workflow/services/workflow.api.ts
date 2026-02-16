import api from '../../../core/api/axios';
import type {
  Approval,
  ApprovalHistory,
  ApprovalStats,
  CreateApprovalDto,
  ApproveStepDto,
  RejectApprovalDto,
} from '../types';

interface ListParams {
  requesterId?: string;
  approverId?: string;
  status?: string;
  entityType?: string;
  skip?: number;
  take?: number;
}

interface ListResponse<T> {
  data: T[];
  total: number;
}

export const workflowApi = {
  // Approvals
  getApprovals: async (params?: ListParams): Promise<ListResponse<Approval>> => {
    const response = await api.get<ListResponse<Approval>>('/workflow/approvals', { params });
    return response.data;
  },

  getPendingApprovals: async (): Promise<Approval[]> => {
    const response = await api.get<Approval[]>('/workflow/approvals/pending');
    return response.data;
  },

  getApproval: async (id: string): Promise<Approval> => {
    const response = await api.get<Approval>(`/workflow/approvals/${id}`);
    return response.data;
  },

  createApproval: async (data: CreateApprovalDto): Promise<Approval> => {
    const response = await api.post<Approval>('/workflow/approvals', data);
    return response.data;
  },

  approveStep: async (id: string, data?: ApproveStepDto): Promise<Approval> => {
    const response = await api.post<Approval>(`/workflow/approvals/${id}/approve`, data);
    return response.data;
  },

  rejectApproval: async (id: string, data: RejectApprovalDto): Promise<Approval> => {
    const response = await api.post<Approval>(`/workflow/approvals/${id}/reject`, data);
    return response.data;
  },

  // History
  getApprovalHistory: async (entityType: string, entityId: string): Promise<ApprovalHistory> => {
    const response = await api.get<ApprovalHistory>(`/workflow/history/${entityType}/${entityId}`);
    return response.data;
  },

  // Stats
  getApprovalStats: async (): Promise<ApprovalStats> => {
    const response = await api.get<ApprovalStats>('/workflow/stats');
    return response.data;
  },
};

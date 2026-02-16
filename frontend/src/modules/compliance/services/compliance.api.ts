import api from '../../../core/api/axios';
import type {
  FilingRecord,
  PolicyAcknowledgement,
  ComplianceDashboard,
  ComplianceStats,
  CreateFilingRecordDto,
  CreatePolicyAcknowledgementDto,
  PolicyComplianceReport,
} from '../types';

interface ListParams {
  type?: string;
  status?: string;
  employeeId?: string;
  policyName?: string;
  skip?: number;
  take?: number;
}

interface ListResponse<T> {
  data: T[];
  total: number;
}

export const complianceApi = {
  // Filing Records
  getFilings: async (params?: ListParams): Promise<ListResponse<FilingRecord>> => {
    const response = await api.get<ListResponse<FilingRecord>>('/compliance/filings', { params });
    return response.data;
  },

  getUpcomingFilings: async (): Promise<FilingRecord[]> => {
    const response = await api.get<FilingRecord[]>('/compliance/filings/upcoming');
    return response.data;
  },

  getFiling: async (id: string): Promise<FilingRecord> => {
    const response = await api.get<FilingRecord>(`/compliance/filings/${id}`);
    return response.data;
  },

  createFiling: async (data: CreateFilingRecordDto): Promise<FilingRecord> => {
    const response = await api.post<FilingRecord>('/compliance/filings', data);
    return response.data;
  },

  fileFiling: async (id: string, receiptNo?: string): Promise<FilingRecord> => {
    const response = await api.post<FilingRecord>(`/compliance/filings/${id}/file`, { receiptNo });
    return response.data;
  },

  acknowledgeFiling: async (id: string): Promise<FilingRecord> => {
    const response = await api.post<FilingRecord>(`/compliance/filings/${id}/acknowledge`);
    return response.data;
  },

  // Policy Acknowledgements
  getPolicyAcknowledgements: async (params?: ListParams): Promise<ListResponse<PolicyAcknowledgement>> => {
    const response = await api.get<ListResponse<PolicyAcknowledgement>>('/compliance/policies/acknowledgements', { params });
    return response.data;
  },

  createPolicyAcknowledgement: async (data: CreatePolicyAcknowledgementDto): Promise<PolicyAcknowledgement> => {
    const response = await api.post<PolicyAcknowledgement>('/compliance/policies/acknowledge', data);
    return response.data;
  },

  getPolicyComplianceReport: async (policyName: string): Promise<PolicyComplianceReport> => {
    const response = await api.get<PolicyComplianceReport>(`/compliance/policies/${policyName}/report`);
    return response.data;
  },

  // Dashboard & Stats
  getComplianceDashboard: async (): Promise<ComplianceDashboard> => {
    const response = await api.get<ComplianceDashboard>('/compliance/dashboard');
    return response.data;
  },

  getComplianceStats: async (): Promise<ComplianceStats> => {
    const response = await api.get<ComplianceStats>('/compliance/stats');
    return response.data;
  },
};

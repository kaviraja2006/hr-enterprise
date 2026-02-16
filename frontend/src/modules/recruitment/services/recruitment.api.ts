import api from '../../../core/api/axios';
import type {
  Job,
  Candidate,
  RecruitmentSummary,
  RecruitmentStats,
  CreateJobDto,
  CreateCandidateDto,
} from '../types';

interface ListParams {
  status?: string;
  departmentId?: string;
  jobId?: string;
  stage?: string;
  skip?: number;
  take?: number;
}

interface ListResponse<T> {
  data: T[];
  total: number;
}

export const recruitmentApi = {
  // Jobs
  getJobs: async (params?: ListParams): Promise<Job[]> => {
    const response = await api.get<Job[]>('/recruitment/jobs', { params });
    return response.data;
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await api.get<Job>(`/recruitment/jobs/${id}`);
    return response.data;
  },

  createJob: async (data: CreateJobDto): Promise<Job> => {
    const response = await api.post<Job>('/recruitment/jobs', data);
    return response.data;
  },

  publishJob: async (id: string): Promise<Job> => {
    const response = await api.post<Job>(`/recruitment/jobs/${id}/publish`);
    return response.data;
  },

  closeJob: async (id: string): Promise<Job> => {
    const response = await api.post<Job>(`/recruitment/jobs/${id}/close`);
    return response.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/recruitment/jobs/${id}`);
  },

  // Candidates
  getCandidates: async (params?: ListParams): Promise<ListResponse<Candidate>> => {
    const response = await api.get<ListResponse<Candidate>>('/recruitment/candidates', { params });
    return response.data;
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    const response = await api.get<Candidate>(`/recruitment/candidates/${id}`);
    return response.data;
  },

  createCandidate: async (data: CreateCandidateDto): Promise<Candidate> => {
    const response = await api.post<Candidate>('/recruitment/candidates', data);
    return response.data;
  },

  moveCandidateStage: async (id: string, stage: string): Promise<Candidate> => {
    const response = await api.patch<Candidate>(`/recruitment/candidates/${id}/stage`, { stage });
    return response.data;
  },

  convertToEmployee: async (id: string): Promise<void> => {
    await api.post(`/recruitment/candidates/${id}/convert`);
  },

  deleteCandidate: async (id: string): Promise<void> => {
    await api.delete(`/recruitment/candidates/${id}`);
  },

  // Summary & Stats
  getRecruitmentSummary: async (): Promise<RecruitmentSummary> => {
    const response = await api.get<RecruitmentSummary>('/recruitment/summary');
    return response.data;
  },

  getStats: async (): Promise<RecruitmentStats> => {
    const response = await api.get<RecruitmentStats>('/recruitment/stats');
    return response.data;
  },
};

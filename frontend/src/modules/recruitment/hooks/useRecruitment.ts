import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '../services/recruitment.api';
import type {
  CreateJobDto,
  CreateCandidateDto,
  CandidateStage,
} from '../types';

// Query keys
export const recruitmentKeys = {
  all: ['recruitment'] as const,
  jobs: () => [...recruitmentKeys.all, 'jobs'] as const,
  job: (id: string) => [...recruitmentKeys.jobs(), id] as const,
  candidates: () => [...recruitmentKeys.all, 'candidates'] as const,
  candidate: (id: string) => [...recruitmentKeys.candidates(), id] as const,
  summary: () => [...recruitmentKeys.all, 'summary'] as const,
  stats: () => [...recruitmentKeys.all, 'stats'] as const,
};

// Job hooks
export function useJobs(params?: { status?: string; departmentId?: string }) {
  return useQuery({
    queryKey: [...recruitmentKeys.jobs(), params],
    queryFn: () => recruitmentApi.getJobs(params),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: recruitmentKeys.job(id),
    queryFn: () => recruitmentApi.getJob(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobDto) => recruitmentApi.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.stats() });
    },
  });
}

export function usePublishJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApi.publishJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.stats() });
    },
  });
}

export function useCloseJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApi.closeJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.stats() });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApi.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.stats() });
    },
  });
}

// Candidate hooks
export function useCandidates(params?: { jobId?: string; stage?: string }) {
  return useQuery({
    queryKey: [...recruitmentKeys.candidates(), params],
    queryFn: () => recruitmentApi.getCandidates(params),
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: recruitmentKeys.candidate(id),
    queryFn: () => recruitmentApi.getCandidate(id),
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCandidateDto) => recruitmentApi.createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.stats() });
    },
  });
}

export function useMoveCandidateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: CandidateStage }) =>
      recruitmentApi.moveCandidateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.summary() });
    },
  });
}

export function useConvertToEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApi.convertToEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.stats() });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApi.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates() });
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.stats() });
    },
  });
}

// Summary & Stats hooks
export function useRecruitmentSummary() {
  return useQuery({
    queryKey: recruitmentKeys.summary(),
    queryFn: () => recruitmentApi.getRecruitmentSummary(),
  });
}

export function useRecruitmentStats() {
  return useQuery({
    queryKey: recruitmentKeys.stats(),
    queryFn: () => recruitmentApi.getStats(),
  });
}

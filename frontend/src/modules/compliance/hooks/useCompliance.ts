import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complianceApi } from '../services/compliance.api';
import type {
  CreateFilingRecordDto,
  CreatePolicyAcknowledgementDto,
  FilingType,
  FilingStatus,
} from '../types';

// Query keys
export const complianceKeys = {
  all: ['compliance'] as const,
  filings: () => [...complianceKeys.all, 'filings'] as const,
  filing: (id: string) => [...complianceKeys.filings(), id] as const,
  upcoming: () => [...complianceKeys.all, 'upcoming'] as const,
  acknowledgements: () => [...complianceKeys.all, 'acknowledgements'] as const,
  dashboard: () => [...complianceKeys.all, 'dashboard'] as const,
  stats: () => [...complianceKeys.all, 'stats'] as const,
  policyReport: (policyName: string) => [...complianceKeys.all, 'policy', policyName] as const,
};

// Filing hooks
export function useFilings(params?: { type?: FilingType; status?: FilingStatus }) {
  return useQuery({
    queryKey: [...complianceKeys.filings(), params],
    queryFn: () => complianceApi.getFilings(params),
  });
}

export function useUpcomingFilings() {
  return useQuery({
    queryKey: complianceKeys.upcoming(),
    queryFn: () => complianceApi.getUpcomingFilings(),
  });
}

export function useFiling(id: string) {
  return useQuery({
    queryKey: complianceKeys.filing(id),
    queryFn: () => complianceApi.getFiling(id),
    enabled: !!id,
  });
}

export function useCreateFiling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFilingRecordDto) => complianceApi.createFiling(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.filings() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.stats() });
    },
  });
}

export function useFileFiling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, receiptNo }: { id: string; receiptNo?: string }) =>
      complianceApi.fileFiling(id, receiptNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.filings() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.stats() });
    },
  });
}

export function useAcknowledgeFiling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => complianceApi.acknowledgeFiling(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.filings() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.stats() });
    },
  });
}

// Policy hooks
export function usePolicyAcknowledgements(params?: { employeeId?: string; policyName?: string }) {
  return useQuery({
    queryKey: [...complianceKeys.acknowledgements(), params],
    queryFn: () => complianceApi.getPolicyAcknowledgements(params),
  });
}

export function useCreatePolicyAcknowledgement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePolicyAcknowledgementDto) => complianceApi.createPolicyAcknowledgement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.acknowledgements() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.dashboard() });
    },
  });
}

export function usePolicyComplianceReport(policyName: string) {
  return useQuery({
    queryKey: complianceKeys.policyReport(policyName),
    queryFn: () => complianceApi.getPolicyComplianceReport(policyName),
    enabled: !!policyName,
  });
}

// Dashboard & Stats hooks
export function useComplianceDashboard() {
  return useQuery({
    queryKey: complianceKeys.dashboard(),
    queryFn: () => complianceApi.getComplianceDashboard(),
  });
}

export function useComplianceStats() {
  return useQuery({
    queryKey: complianceKeys.stats(),
    queryFn: () => complianceApi.getComplianceStats(),
  });
}

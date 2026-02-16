import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../services/payroll.api';
import type {
  CreateSalaryStructureDto,
  UpdateSalaryStructureDto,
  CreatePayrollRunDto,
} from '../types';

// Query keys
export const payrollKeys = {
  all: ['payroll'] as const,
  structures: () => [...payrollKeys.all, 'structures'] as const,
  structure: (id: string) => [...payrollKeys.structures(), id] as const,
  runs: () => [...payrollKeys.all, 'runs'] as const,
  run: (id: string) => [...payrollKeys.runs(), id] as const,
  entry: (id: string) => [...payrollKeys.all, 'entry', id] as const,
  summary: (id: string) => [...payrollKeys.run(id), 'summary'] as const,
  stats: () => [...payrollKeys.all, 'stats'] as const,
};

// Salary Structure hooks
export function useSalaryStructures() {
  return useQuery({
    queryKey: payrollKeys.structures(),
    queryFn: () => payrollApi.getSalaryStructures(),
  });
}

export function useSalaryStructure(id: string) {
  return useQuery({
    queryKey: payrollKeys.structure(id),
    queryFn: () => payrollApi.getSalaryStructure(id),
    enabled: !!id,
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalaryStructureDto) => payrollApi.createSalaryStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.structures() });
    },
  });
}

export function useUpdateSalaryStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalaryStructureDto }) =>
      payrollApi.updateSalaryStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.structures() });
    },
  });
}

export function useDeleteSalaryStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.deleteSalaryStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.structures() });
    },
  });
}

// Payroll Run hooks
export function usePayrollRuns() {
  return useQuery({
    queryKey: payrollKeys.runs(),
    queryFn: () => payrollApi.getPayrollRuns(),
  });
}

export function usePayrollRun(id: string) {
  return useQuery({
    queryKey: payrollKeys.run(id),
    queryFn: () => payrollApi.getPayrollRun(id),
    enabled: !!id,
  });
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayrollRunDto) => payrollApi.createPayrollRun(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
    },
  });
}

export function useDeletePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.deletePayrollRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
    },
  });
}

export function useCalculatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.calculatePayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.run(id) });
      queryClient.invalidateQueries({ queryKey: payrollKeys.summary(id) });
    },
  });
}

export function useApprovePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.approvePayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.run(id) });
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
    },
  });
}

export function useProcessPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.processPayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.run(id) });
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() });
    },
  });
}

// Payroll Entry hooks
export function usePayrollEntry(id: string) {
  return useQuery({
    queryKey: payrollKeys.entry(id),
    queryFn: () => payrollApi.getPayrollEntry(id),
    enabled: !!id,
  });
}

export function useUpdatePayrollEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { lopDays?: number; notes?: string } }) =>
      payrollApi.updatePayrollEntry(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.entry(id) });
    },
  });
}

// Summary & Stats hooks
export function usePayrollSummary(id: string) {
  return useQuery({
    queryKey: payrollKeys.summary(id),
    queryFn: () => payrollApi.getPayrollSummary(id),
    enabled: !!id,
  });
}

export function usePayrollStats() {
  return useQuery({
    queryKey: payrollKeys.stats(),
    queryFn: () => payrollApi.getPayrollStats(),
  });
}

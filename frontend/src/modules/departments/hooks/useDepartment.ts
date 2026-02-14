import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '../services/department.api';
import type { DepartmentListParams, CreateDepartmentDto, UpdateDepartmentDto } from '../types';

// Query keys
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params: DepartmentListParams) => [...departmentKeys.lists(), params] as const,
  allList: () => [...departmentKeys.all, 'all'] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
  stats: () => [...departmentKeys.all, 'stats'] as const,
};

// List departments hook
export function useDepartments(params: DepartmentListParams = {}) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => departmentApi.list(params),
  });
}

// Get all departments (no pagination)
export function useAllDepartments() {
  return useQuery({
    queryKey: departmentKeys.allList(),
    queryFn: () => departmentApi.listAll(),
  });
}

// Get single department hook
export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentApi.get(id),
    enabled: !!id,
  });
}

// Get department stats hook
export function useDepartmentStats() {
  return useQuery({
    queryKey: departmentKeys.stats(),
    queryFn: () => departmentApi.getStats(),
  });
}

// Create department hook
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentDto) => departmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.allList() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.stats() });
    },
  });
}

// Update department hook
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentDto }) =>
      departmentApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.allList() });
    },
  });
}

// Delete department hook
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.allList() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.stats() });
    },
  });
}

// Assign department head hook
export function useAssignDepartmentHead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ departmentId, headId }: { departmentId: string; headId: string }) =>
      departmentApi.assignHead(departmentId, headId),
    onSuccess: (_, { departmentId }) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(departmentId) });
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}

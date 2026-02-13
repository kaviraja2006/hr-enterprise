import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchDepartments,
  fetchDesignations,
} from '@/api/employees';
import type { CreateEmployeeInput, UpdateEmployeeInput } from '@/types';

export const useEmployees = () =>
  useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
  });

export const useEmployee = (id: string) =>
  useQuery({
    queryKey: ['employees', id],
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
  });

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeeInput }) =>
      updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDepartments = () =>
  useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

export const useDesignations = () =>
  useQuery({
    queryKey: ['designations'],
    queryFn: fetchDesignations,
  });

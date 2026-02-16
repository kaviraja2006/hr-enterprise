import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/settings.api';
import type {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  SystemSettings,
} from '../types';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  roles: () => [...settingsKeys.all, 'roles'] as const,
  role: (id: string) => [...settingsKeys.roles(), id] as const,
  permissions: () => [...settingsKeys.all, 'permissions'] as const,
  system: () => [...settingsKeys.all, 'system'] as const,
};

// Role hooks
export function useRoles() {
  return useQuery({
    queryKey: settingsKeys.roles(),
    queryFn: () => settingsApi.getRoles(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: settingsKeys.role(id),
    queryFn: () => settingsApi.getRole(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleDto) => settingsApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      settingsApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() });
    },
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      settingsApi.assignPermissions(roleId, { permissionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() });
    },
  });
}

// Permission hooks
export function usePermissions() {
  return useQuery({
    queryKey: settingsKeys.permissions(),
    queryFn: () => settingsApi.getPermissions(),
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionDto) => settingsApi.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.permissions() });
    },
  });
}

// Seed hook
export function useSeedDefaultRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsApi.seedDefaultRoles(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.permissions() });
    },
  });
}

// System Settings hooks
export function useSystemSettings() {
  return useQuery({
    queryKey: settingsKeys.system(),
    queryFn: () => settingsApi.getSystemSettings(),
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SystemSettings>) => settingsApi.updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.system() });
    },
  });
}

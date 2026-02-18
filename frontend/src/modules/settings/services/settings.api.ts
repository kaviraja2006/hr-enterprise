import { apiClient } from '../../../core/api/api-client';
import type {
  Role,
  Permission,
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  AssignPermissionsDto,
  SystemSettings,
} from '../types';

export const settingsApi = {
  // Roles
  getRoles: async (): Promise<Role[]> => {
    return apiClient.get<Role[]>('/rbac/roles');
  },

  getRole: async (id: string): Promise<Role> => {
    return apiClient.get<Role>(`/rbac/roles/${id}`);
  },

  createRole: async (data: CreateRoleDto): Promise<Role> => {
    return apiClient.post<Role>('/rbac/roles', data);
  },

  updateRole: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    return apiClient.patch<Role>(`/rbac/roles/${id}`, data);
  },

  deleteRole: async (id: string): Promise<void> => {
    return apiClient.delete(`/rbac/roles/${id}`);
  },

  assignPermissions: async (roleId: string, data: AssignPermissionsDto): Promise<Role> => {
    return apiClient.post<Role>(`/rbac/roles/${roleId}/permissions`, data);
  },

  // Permissions
  getPermissions: async (): Promise<Permission[]> => {
    return apiClient.get<Permission[]>('/rbac/permissions');
  },

  createPermission: async (data: CreatePermissionDto): Promise<Permission> => {
    return apiClient.post<Permission>('/rbac/permissions', data);
  },

  // Seed
  seedDefaultRoles: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/rbac/seed');
  },

  // System Settings (Stubbed - no backend endpoint)
  getSystemSettings: async (): Promise<SystemSettings> => {
    return Promise.resolve({
      companyName: 'HR Enterprise',
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR',
      emailNotifications: true,
      smsNotifications: false,
      workingHours: { start: '09:00', end: '18:00', workingDays: [1, 2, 3, 4, 5] },
    });
  },

  updateSystemSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    const current = await settingsApi.getSystemSettings();
    return Promise.resolve({ ...current, ...data });
  },
};

import api from '../../../core/api/axios';
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
    const response = await api.get<Role[]>('/rbac/roles');
    return response.data;
  },

  getRole: async (id: string): Promise<Role> => {
    const response = await api.get<Role>(`/rbac/roles/${id}`);
    return response.data;
  },

  createRole: async (data: CreateRoleDto): Promise<Role> => {
    const response = await api.post<Role>('/rbac/roles', data);
    return response.data;
  },

  updateRole: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    const response = await api.patch<Role>(`/rbac/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/rbac/roles/${id}`);
  },

  assignPermissions: async (roleId: string, data: AssignPermissionsDto): Promise<Role> => {
    const response = await api.post<Role>(`/rbac/roles/${roleId}/permissions`, data);
    return response.data;
  },

  // Permissions
  getPermissions: async (): Promise<Permission[]> => {
    const response = await api.get<Permission[]>('/rbac/permissions');
    return response.data;
  },

  createPermission: async (data: CreatePermissionDto): Promise<Permission> => {
    const response = await api.post<Permission>('/rbac/permissions', data);
    return response.data;
  },

  // Seed
  seedDefaultRoles: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/rbac/seed');
    return response.data;
  },

  // System Settings
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await api.get<SystemSettings>('/settings');
    return response.data;
  },

  updateSystemSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await api.patch<SystemSettings>('/settings', data);
    return response.data;
  },
};

import api from '../../../core/api/axios';
import type {
  Department,
  DepartmentListParams,
  DepartmentListResponse,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentStats,
} from '../types';

export const departmentApi = {
  // List departments with pagination and filters
  list: async (params: DepartmentListParams): Promise<DepartmentListResponse> => {
    const response = await api.get<DepartmentListResponse>('/departments', { params });
    return response.data;
  },

  // Get all departments (no pagination)
  listAll: async (): Promise<Department[]> => {
    const response = await api.get<Department[]>('/departments/all');
    return response.data;
  },

  // Get single department by ID
  get: async (id: string): Promise<Department> => {
    const response = await api.get<Department>(`/departments/${id}`);
    return response.data;
  },

  // Create new department
  create: async (data: CreateDepartmentDto): Promise<Department> => {
    const response = await api.post<Department>('/departments', data);
    return response.data;
  },

  // Update department
  update: async (id: string, data: UpdateDepartmentDto): Promise<Department> => {
    const response = await api.patch<Department>(`/departments/${id}`, data);
    return response.data;
  },

  // Delete department
  delete: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  // Get department statistics
  getStats: async (): Promise<DepartmentStats> => {
    const response = await api.get<DepartmentStats>('/departments/stats');
    return response.data;
  },

  // Assign department head
  assignHead: async (departmentId: string, headId: string): Promise<Department> => {
    const response = await api.patch<Department>(`/departments/${departmentId}/head`, {
      headId,
    });
    return response.data;
  },
};

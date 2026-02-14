import api from '../../../core/api/axios';
import type {
  Employee,
  EmployeeListParams,
  EmployeeListResponse,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeStats,
} from '../types';

export const employeeApi = {
  // List employees with pagination and filters
  list: async (params: EmployeeListParams): Promise<EmployeeListResponse> => {
    const response = await api.get<EmployeeListResponse>('/employees', { params });
    return response.data;
  },

  // Get single employee by ID
  get: async (id: string): Promise<Employee> => {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  // Create new employee
  create: async (data: CreateEmployeeDto): Promise<Employee> => {
    const response = await api.post<Employee>('/employees', data);
    return response.data;
  },

  // Update employee
  update: async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
    const response = await api.patch<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  // Delete employee
  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  // Get employee statistics
  getStats: async (): Promise<EmployeeStats> => {
    const response = await api.get<EmployeeStats>('/employees/stats');
    return response.data;
  },

  // Get employees by department
  getByDepartment: async (departmentId: string): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/departments/${departmentId}/employees`);
    return response.data;
  },

  // Get employees reporting to a manager
  getSubordinates: async (managerId: string): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/employees/${managerId}/subordinates`);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (id: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>(
      `/employees/${id}/profile-picture`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  // Export employees to CSV
  exportCsv: async (params?: EmployeeListParams): Promise<Blob> => {
    const response = await api.get('/employees/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

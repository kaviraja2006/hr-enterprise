// Department Types

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  head?: DepartmentHead;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentHead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DepartmentListResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  headId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  headId?: string;
}

export interface DepartmentStats {
  total: number;
  withHead: number;
  withoutHead: number;
  avgEmployeesPerDept: number;
}

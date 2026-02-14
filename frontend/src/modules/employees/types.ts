// Employee Types

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  profilePicture?: string;
  departmentId?: string;
  department?: Department;
  designationId?: string;
  designation?: Designation;
  managerId?: string;
  manager?: Employee;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joinDate: string;
  endDate?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  bankDetails?: BankDetails;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  head?: Employee;
  employeeCount?: number;
}

export interface Designation {
  id: string;
  title: string;
  description?: string;
  level?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  managerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateEmployeeDto {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  departmentId?: string;
  designationId?: string;
  managerId?: string;
  employmentType: EmploymentType;
  joinDate: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  bankDetails?: BankDetails;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  departmentId?: string;
  designationId?: string;
  managerId?: string;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
  address?: Address;
  emergencyContact?: EmergencyContact;
  bankDetails?: BankDetails;
}

export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  terminated: number;
  byDepartment: { department: string; count: number }[];
  byEmploymentType: { type: string; count: number }[];
  newJoiners: number;
  avgTenure: number;
}

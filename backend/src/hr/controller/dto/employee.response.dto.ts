export class EmployeeResponseDto {
  id!: string;
  userId!: string;
  employeeCode!: string;
  firstName!: string;
  lastName!: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
    description?: string;
  };
  designationId?: string;
  designation?: {
    id: string;
    title: string;
  };
  status!: 'active' | 'inactive';
  joinDate!: string;
  createdAt!: string;
  updatedAt!: string;
}

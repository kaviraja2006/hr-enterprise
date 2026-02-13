import { InvalidEmployeeDataError } from './hr.errors';

// Employee code format: EMP followed by 3-5 digits (e.g., EMP001, EMP12345)
const EMPLOYEE_CODE_REGEX = /^EMP\d{3,5}$/;

export interface EmployeeData {
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  departmentId?: string;
  designationId?: string;
  joinDate: Date;
}

export interface EmployeeSnapshot extends EmployeeData {
  id: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class EmployeeDomain {
  static validateEmployeeCode(code: string): void {
    if (!code || code.trim().length === 0) {
      throw new InvalidEmployeeDataError(
        'Employee code is required',
        'employeeCode',
      );
    }

    if (!EMPLOYEE_CODE_REGEX.test(code)) {
      throw new InvalidEmployeeDataError(
        'Employee code must be in format EMP followed by 3-5 digits (e.g., EMP001)',
        'employeeCode',
      );
    }
  }

  static validateName(firstName: string, lastName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new InvalidEmployeeDataError('First name is required', 'firstName');
    }

    if (firstName.length < 2 || firstName.length > 50) {
      throw new InvalidEmployeeDataError(
        'First name must be between 2 and 50 characters',
        'firstName',
      );
    }

    if (!lastName || lastName.trim().length === 0) {
      throw new InvalidEmployeeDataError('Last name is required', 'lastName');
    }

    if (lastName.length < 2 || lastName.length > 50) {
      throw new InvalidEmployeeDataError(
        'Last name must be between 2 and 50 characters',
        'lastName',
      );
    }
  }

  static validateJoinDate(joinDate: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const joinDateNormalized = new Date(joinDate);
    joinDateNormalized.setHours(0, 0, 0, 0);

    if (joinDateNormalized > today) {
      throw new InvalidEmployeeDataError(
        'Join date cannot be in the future',
        'joinDate',
      );
    }
  }

  static validateUserId(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new InvalidEmployeeDataError('User ID is required', 'userId');
    }
  }

  static validateCreate(data: EmployeeData): void {
    this.validateUserId(data.userId);
    this.validateEmployeeCode(data.employeeCode);
    this.validateName(data.firstName, data.lastName);
    this.validateJoinDate(data.joinDate);
  }

  static validateUpdate(data: Partial<EmployeeData>): void {
    if (data.employeeCode !== undefined) {
      this.validateEmployeeCode(data.employeeCode);
    }

    if (data.firstName !== undefined || data.lastName !== undefined) {
      this.validateName(data.firstName ?? '', data.lastName ?? '');
    }

    if (data.joinDate !== undefined) {
      this.validateJoinDate(data.joinDate);
    }
  }

  static canActivate(employee: EmployeeSnapshot): boolean {
    return employee.status === 'inactive' && !employee.deletedAt;
  }

  static canDeactivate(employee: EmployeeSnapshot): boolean {
    return employee.status === 'active';
  }

  static isDeleted(employee: EmployeeSnapshot): boolean {
    return !!employee.deletedAt;
  }
}

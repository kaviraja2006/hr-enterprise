import { Injectable, Logger, Inject } from '@nestjs/common';
import type { HrRepository } from '../repository/hr.repository';
import { EmployeeDomain } from '../domain/employee.domain';
import type { EmployeeSnapshot } from '../domain/employee.domain';
import {
  EmployeeNotFoundError,
  EmployeeCodeAlreadyExistsError,
  DepartmentNotFoundError,
  DesignationNotFoundError,
} from '../domain/hr.errors';
import type { EmployeeFilters } from '../repository/hr.repository';
import type {
  DepartmentSnapshot,
  DesignationSnapshot,
} from '../domain/reference.domain';

export interface CreateEmployeeInput {
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  departmentId?: string;
  designationId?: string;
  joinDate: Date;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  departmentId?: string;
  designationId?: string;
  status?: 'active' | 'inactive';
}

@Injectable()
export class EmployeeApplicationService {
  private readonly logger = new Logger(EmployeeApplicationService.name);

  constructor(
    @Inject('HrRepository')
    private readonly repository: HrRepository,
  ) {}

  async createEmployee(input: CreateEmployeeInput): Promise<EmployeeSnapshot> {
    this.logger.debug(`Creating employee with code: ${input.employeeCode}`);

    // Validate business rules
    EmployeeDomain.validateCreate(input);

    // Check if employee code already exists
    const codeExists = await this.repository.employeeCodeExists(
      input.employeeCode,
    );
    if (codeExists) {
      throw new EmployeeCodeAlreadyExistsError(input.employeeCode);
    }

    // Validate department if provided
    if (input.departmentId) {
      const department = await this.repository.findDepartmentById(
        input.departmentId,
      );
      if (!department) {
        throw new DepartmentNotFoundError(input.departmentId);
      }
    }

    // Validate designation if provided
    if (input.designationId) {
      const designation = await this.repository.findDesignationById(
        input.designationId,
      );
      if (!designation) {
        throw new DesignationNotFoundError(input.designationId);
      }
    }

    // Create employee
    const employee = await this.repository.createEmployee({
      userId: input.userId,
      employeeCode: input.employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      departmentId: input.departmentId,
      designationId: input.designationId,
      joinDate: input.joinDate,
    });

    this.logger.debug(`Employee created with ID: ${employee.id}`);
    return employee;
  }

  async getEmployeeById(id: string): Promise<EmployeeSnapshot> {
    this.logger.debug(`Finding employee by ID: ${id}`);

    const employee = await this.repository.findEmployeeById(id);
    if (!employee) {
      throw new EmployeeNotFoundError(id);
    }

    return employee;
  }

  async getEmployeeByCode(code: string): Promise<EmployeeSnapshot> {
    this.logger.debug(`Finding employee by code: ${code}`);

    const employee = await this.repository.findEmployeeByCode(code);
    if (!employee) {
      throw new EmployeeNotFoundError(code);
    }

    return employee;
  }

  async listEmployees(filters?: EmployeeFilters): Promise<EmployeeSnapshot[]> {
    this.logger.debug('Listing employees', filters);
    return this.repository.listEmployees(filters);
  }

  async updateEmployee(
    id: string,
    input: UpdateEmployeeInput,
  ): Promise<EmployeeSnapshot> {
    this.logger.debug(`Updating employee: ${id}`);

    // Validate update data
    EmployeeDomain.validateUpdate(input);

    // Check if employee exists
    const existingEmployee = await this.repository.findEmployeeById(id);
    if (!existingEmployee) {
      throw new EmployeeNotFoundError(id);
    }

    // Validate department if changing
    if (
      input.departmentId &&
      input.departmentId !== existingEmployee.departmentId
    ) {
      const department = await this.repository.findDepartmentById(
        input.departmentId,
      );
      if (!department) {
        throw new DepartmentNotFoundError(input.departmentId);
      }
    }

    // Validate designation if changing
    if (
      input.designationId &&
      input.designationId !== existingEmployee.designationId
    ) {
      const designation = await this.repository.findDesignationById(
        input.designationId,
      );
      if (!designation) {
        throw new DesignationNotFoundError(input.designationId);
      }
    }

    // Update employee
    const employee = await this.repository.updateEmployee(id, input);
    this.logger.debug(`Employee updated: ${employee.id}`);

    return employee;
  }

  async deleteEmployee(id: string): Promise<void> {
    this.logger.debug(`Deleting employee: ${id}`);

    const employee = await this.repository.findEmployeeById(id);
    if (!employee) {
      throw new EmployeeNotFoundError(id);
    }

    await this.repository.softDeleteEmployee(id);
    this.logger.debug(`Employee soft deleted: ${id}`);
  }

  async listDepartments(): Promise<DepartmentSnapshot[]> {
    this.logger.debug('Listing departments');
    return this.repository.listDepartments();
  }

  async listDesignations(): Promise<DesignationSnapshot[]> {
    this.logger.debug('Listing designations');
    return this.repository.listDesignations();
  }
}

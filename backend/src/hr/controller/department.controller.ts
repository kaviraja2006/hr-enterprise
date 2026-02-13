import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { EmployeeApplicationService } from '../application/employee.application';
import type { DepartmentSnapshot } from '../domain/reference.domain';

@Controller('departments')
export class DepartmentController {
  private readonly logger = new Logger(DepartmentController.name);

  constructor(private readonly employeeService: EmployeeApplicationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async listDepartments(): Promise<DepartmentSnapshot[]> {
    this.logger.debug('Listing departments');
    return this.employeeService.listDepartments();
  }
}

import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { EmployeeApplicationService } from '../application/employee.application';
import type { DesignationSnapshot } from '../domain/reference.domain';

@Controller('designations')
export class DesignationController {
  private readonly logger = new Logger(DesignationController.name);

  constructor(private readonly employeeService: EmployeeApplicationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async listDesignations(): Promise<DesignationSnapshot[]> {
    this.logger.debug('Listing designations');
    return this.employeeService.listDesignations();
  }
}

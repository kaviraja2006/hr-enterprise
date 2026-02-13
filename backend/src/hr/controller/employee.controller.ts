import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EmployeeApplicationService } from '../application/employee.application';
import type { EmployeeSnapshot } from '../domain/employee.domain';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.dto';

@Controller('employees')
export class EmployeeController {
  private readonly logger = new Logger(EmployeeController.name);

  constructor(private readonly employeeService: EmployeeApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEmployee(
    @Body() dto: CreateEmployeeDto,
  ): Promise<EmployeeSnapshot> {
    this.logger.debug(`Creating employee: ${dto.employeeCode}`);
    return this.employeeService.createEmployee({
      userId: dto.userId,
      employeeCode: dto.employeeCode,
      firstName: dto.firstName,
      lastName: dto.lastName,
      departmentId: dto.departmentId,
      designationId: dto.designationId,
      joinDate: new Date(dto.joinDate),
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listEmployees(
    @Query() query: ListEmployeesQueryDto,
  ): Promise<EmployeeSnapshot[]> {
    this.logger.debug('Listing employees');
    return this.employeeService.listEmployees({
      status: query.status,
      departmentId: query.departmentId,
      designationId: query.designationId,
      search: query.search,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getEmployeeById(@Param('id') id: string): Promise<EmployeeSnapshot> {
    this.logger.debug(`Getting employee: ${id}`);
    return this.employeeService.getEmployeeById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<EmployeeSnapshot> {
    this.logger.debug(`Updating employee: ${id}`);
    return this.employeeService.updateEmployee(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEmployee(@Param('id') id: string): Promise<void> {
    this.logger.debug(`Deleting employee: ${id}`);
    await this.employeeService.deleteEmployee(id);
  }
}

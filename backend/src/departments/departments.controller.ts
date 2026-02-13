import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import { Permissions } from '../common/decorators';

@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Permissions('departments:create')
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Permissions('departments:read')
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @Permissions('departments:read')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('departments:update')
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Permissions('departments:delete')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }

  @Post(':id/head/:headId')
  @Permissions('departments:update')
  assignHead(@Param('id') id: string, @Param('headId') headId: string) {
    return this.departmentsService.assignHead(id, headId);
  }
}

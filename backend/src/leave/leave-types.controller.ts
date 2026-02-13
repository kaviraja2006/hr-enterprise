import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import { Permissions } from '../common/decorators';

@Controller('leave-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveTypesController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @Permissions('leave:manage')
  create(@Body() createLeaveTypeDto: CreateLeaveTypeDto) {
    return this.leaveService.createLeaveType(createLeaveTypeDto);
  }

  @Get()
  @Permissions('leave:read')
  findAll() {
    return this.leaveService.findAllLeaveTypes();
  }

  @Get(':id')
  @Permissions('leave:read')
  findOne(@Param('id') id: string) {
    return this.leaveService.findLeaveTypeById(id);
  }

  @Patch(':id')
  @Permissions('leave:manage')
  update(
    @Param('id') id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto,
  ) {
    return this.leaveService.updateLeaveType(id, updateLeaveTypeDto);
  }

  @Delete(':id')
  @Permissions('leave:manage')
  remove(@Param('id') id: string) {
    return this.leaveService.deleteLeaveType(id);
  }
}

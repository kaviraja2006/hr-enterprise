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
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import { Permissions } from '../common/decorators';

@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ============ Role Endpoints ============

  @Get('roles')
  @Permissions('roles:read')
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @Permissions('roles:read')
  findRoleById(@Param('id') id: string) {
    return this.rbacService.findRoleById(id);
  }

  @Post('roles')
  @Permissions('roles:create')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  @Patch('roles/:id')
  @Permissions('roles:update')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  @Permissions('roles:delete')
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  @Post('roles/:id/permissions')
  @Permissions('roles:update')
  assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rbacService.assignPermissions(
      id,
      assignPermissionsDto.permissionIds,
    );
  }

  // ============ Permission Endpoints ============

  @Get('permissions')
  @Permissions('roles:read')
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Post('permissions')
  @Permissions('roles:create')
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(createPermissionDto);
  }

  // ============ Seed Endpoint ============

  @Post('seed')
  @Permissions('roles:create')
  seedDefaultRolesAndPermissions() {
    return this.rbacService.seedDefaultRolesAndPermissions();
  }
}

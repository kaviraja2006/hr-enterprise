import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============ Role Methods ============

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const { name, description, isSystem, permissionIds } = createRoleDto;

    // Check if role name exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name "${name}" already exists`);
    }

    // Validate permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Some permission IDs are invalid');
      }
    }

    const role = await this.prisma.role.create({
      data: {
        name,
        description,
        isSystem: isSystem ?? false,
        permissions: permissionIds
          ? {
              create: permissionIds.map((permissionId) => ({
                permission: { connect: { id: permissionId } },
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    this.logger.log(`Role created: ${name}`);

    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    // Check name uniqueness if updating
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new ConflictException(
          `Role with name "${updateRoleDto.name}" already exists`,
        );
      }
    }

    // Validate permissions if provided
    if (updateRoleDto.permissionIds) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: updateRoleDto.permissionIds } },
      });

      if (permissions.length !== updateRoleDto.permissionIds.length) {
        throw new BadRequestException('Some permission IDs are invalid');
      }
    }

    // Update role and permissions
    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
        ...(updateRoleDto.permissionIds && {
          permissions: {
            deleteMany: {},
            create: updateRoleDto.permissionIds.map((permissionId) => ({
              permission: { connect: { id: permissionId } },
            })),
          },
        }),
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    this.logger.log(`Role updated: ${id}`);

    return updatedRole;
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    if (role._count.users > 0) {
      throw new BadRequestException(
        'Cannot delete role with assigned users. Please reassign users first.',
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });

    this.logger.log(`Role deleted: ${id}`);

    return { message: 'Role deleted successfully' };
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Validate all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Some permission IDs are invalid');
    }

    // Delete existing permissions and create new ones
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({
        where: { roleId },
      }),
      ...permissionIds.map((permissionId) =>
        this.prisma.rolePermission.create({
          data: {
            roleId,
            permissionId,
          },
        }),
      ),
    ]);

    this.logger.log(`Permissions assigned to role ${roleId}`);

    return this.findRoleById(roleId);
  }

  // ============ Permission Methods ============

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
      orderBy: { resource: 'asc' },
    });
  }

  async findPermissionById(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const { name, resource, action } = createPermissionDto;

    // Check if permission exists
    const existingPermission = await this.prisma.permission.findFirst({
      where: {
        resource,
        action,
      },
    });

    if (existingPermission) {
      throw new ConflictException(
        `Permission for ${resource}:${action} already exists`,
      );
    }

    const permission = await this.prisma.permission.create({
      data: {
        name,
        resource,
        action,
      },
    });

    this.logger.log(`Permission created: ${resource}:${action}`);

    return permission;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.role) {
      return [];
    }

    return user.role.permissions.map(
      (rp) => `${rp.permission.resource}:${rp.permission.action}`,
    );
  }

  // ============ Seed Methods ============

  async seedDefaultRolesAndPermissions() {
    // Default permissions
    const defaultPermissions = [
      // User permissions
      { name: 'View Users', resource: 'users', action: 'read' },
      { name: 'Create Users', resource: 'users', action: 'create' },
      { name: 'Update Users', resource: 'users', action: 'update' },
      { name: 'Delete Users', resource: 'users', action: 'delete' },
      // Role permissions
      { name: 'View Roles', resource: 'roles', action: 'read' },
      { name: 'Create Roles', resource: 'roles', action: 'create' },
      { name: 'Update Roles', resource: 'roles', action: 'update' },
      { name: 'Delete Roles', resource: 'roles', action: 'delete' },
      // Employee permissions
      { name: 'View Employees', resource: 'employees', action: 'read' },
      { name: 'Create Employees', resource: 'employees', action: 'create' },
      { name: 'Update Employees', resource: 'employees', action: 'update' },
      { name: 'Delete Employees', resource: 'employees', action: 'delete' },
      // Department permissions
      { name: 'View Departments', resource: 'departments', action: 'read' },
      { name: 'Create Departments', resource: 'departments', action: 'create' },
      { name: 'Update Departments', resource: 'departments', action: 'update' },
      { name: 'Delete Departments', resource: 'departments', action: 'delete' },
      // Attendance permissions
      { name: 'View Attendance', resource: 'attendance', action: 'read' },
      { name: 'Create Attendance', resource: 'attendance', action: 'create' },
      { name: 'Update Attendance', resource: 'attendance', action: 'update' },
      { name: 'Delete Attendance', resource: 'attendance', action: 'delete' },
      // Leave permissions
      { name: 'View Leave Requests', resource: 'leave', action: 'read' },
      { name: 'Create Leave Requests', resource: 'leave', action: 'create' },
      { name: 'Approve Leave', resource: 'leave', action: 'approve' },
      { name: 'Manage Leave Types', resource: 'leave', action: 'manage' },
    ];

    // Create permissions
    for (const perm of defaultPermissions) {
      await this.prisma.permission.upsert({
        where: {
          resource_action: {
            resource: perm.resource,
            action: perm.action,
          },
        },
        update: {},
        create: perm,
      });
    }

    // Get all permissions
    const allPermissions = await this.prisma.permission.findMany();

    // Create default roles
    const adminRole = await this.prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator with full access',
        isSystem: true,
      },
    });

    const hrRole = await this.prisma.role.upsert({
      where: { name: 'hr' },
      update: {},
      create: {
        name: 'hr',
        description: 'HR Manager with employee management access',
        isSystem: true,
      },
    });

    const employeeRole = await this.prisma.role.upsert({
      where: { name: 'employee' },
      update: {},
      create: {
        name: 'employee',
        description: 'Standard employee with limited access',
        isSystem: true,
      },
    });

    // Assign all permissions to admin
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: adminRole.id },
    });
    await this.prisma.rolePermission.createMany({
      data: allPermissions.map((p) => ({
        roleId: adminRole.id,
        permissionId: p.id,
      })),
    });

    // Assign HR permissions
    const hrPermissions = allPermissions.filter(
      (p) =>
        p.resource === 'employees' ||
        p.resource === 'attendance' ||
        p.resource === 'leave' ||
        p.resource === 'departments',
    );

    await this.prisma.rolePermission.deleteMany({
      where: { roleId: hrRole.id },
    });
    await this.prisma.rolePermission.createMany({
      data: hrPermissions.map((p) => ({
        roleId: hrRole.id,
        permissionId: p.id,
      })),
    });

    // Assign basic permissions to employee
    const employeePermissions = allPermissions.filter(
      (p) =>
        (p.resource === 'employees' && p.action === 'read') ||
        (p.resource === 'attendance' && p.action === 'read') ||
        (p.resource === 'leave' && (p.action === 'read' || p.action === 'create')),
    );

    await this.prisma.rolePermission.deleteMany({
      where: { roleId: employeeRole.id },
    });
    await this.prisma.rolePermission.createMany({
      data: employeePermissions.map((p) => ({
        roleId: employeeRole.id,
        permissionId: p.id,
      })),
    });

    this.logger.log('Default roles and permissions seeded');

    return {
      message: 'Default roles and permissions created successfully',
      roles: [adminRole.name, hrRole.name, employeeRole.name],
      permissionsCount: allPermissions.length,
    };
  }
}

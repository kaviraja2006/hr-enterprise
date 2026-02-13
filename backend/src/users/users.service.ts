import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { hashPassword } from '../common/utils/encryption.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    isActive?: boolean;
    roleId?: string;
  }) {
    const { skip = 0, take = 10, isActive, roleId } = params;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (roleId) where.roleId = roleId;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        employee: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, roleId, employeeId, isActive } = createUserDto;

    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role if provided
    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        throw new BadRequestException('Invalid role ID');
      }
    }

    // Validate employee if provided
    if (employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: employeeId },
      });
      if (!employee) {
        throw new BadRequestException('Invalid employee ID');
      }

      // Check if employee is already linked to a user
      const existingLinkedUser = await this.prisma.user.findFirst({
        where: { employeeId },
      });
      if (existingLinkedUser) {
        throw new ConflictException('Employee is already linked to a user');
      }
    }

    // Hash password or generate random one
    const bcryptRounds = this.configService.get<number>('security.bcryptRounds') ?? 12;
    const passwordHash = password
      ? await hashPassword(password, bcryptRounds)
      : await hashPassword(this.generateRandomPassword(), bcryptRounds);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        roleId,
        employeeId,
        isActive: isActive ?? true,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log(`User created: ${email}`);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if updating
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Validate role if provided
    if (updateUserDto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
      });
      if (!role) {
        throw new BadRequestException('Invalid role ID');
      }
    }

    // Validate employee if provided
    if (updateUserDto.employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: updateUserDto.employeeId },
      });
      if (!employee) {
        throw new BadRequestException('Invalid employee ID');
      }

      // Check if employee is already linked to another user
      const existingLinkedUser = await this.prisma.user.findFirst({
        where: {
          employeeId: updateUserDto.employeeId,
          id: { not: id },
        },
      });
      if (existingLinkedUser) {
        throw new ConflictException('Employee is already linked to another user');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log(`User updated: ${id}`);

    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete by deactivating
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`User deactivated: ${id}`);

    return { message: 'User deactivated successfully' };
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const bcryptRounds = this.configService.get<number>('security.bcryptRounds') ?? 12;
    const passwordHash = await hashPassword(newPassword, bcryptRounds);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    this.logger.log(`Password reset for user: ${id}`);

    return { message: 'Password reset successfully' };
  }

  async assignRole(userId: string, roleId: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        throw new BadRequestException('Invalid role ID');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log(`Role assigned to user ${userId}: ${roleId}`);

    return updatedUser;
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

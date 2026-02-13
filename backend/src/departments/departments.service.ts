import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name, headId } = createDepartmentDto;

    // Check if department name exists
    const existingDept = await this.prisma.department.findUnique({
      where: { name },
    });
    if (existingDept) {
      throw new ConflictException(`Department with name "${name}" already exists`);
    }

    // Validate head if provided
    if (headId) {
      const head = await this.prisma.employee.findUnique({
        where: { id: headId },
      });
      if (!head) {
        throw new BadRequestException('Invalid head employee ID');
      }
    }

    const department = await this.prisma.department.create({
      data: createDepartmentDto,
      include: {
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    this.logger.log(`Department created: ${name}`);

    return department;
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
          },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
            designation: true,
            employmentStatus: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check name uniqueness if updating
    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existingDept = await this.prisma.department.findUnique({
        where: { name: updateDepartmentDto.name },
      });
      if (existingDept) {
        throw new ConflictException(
          `Department with name "${updateDepartmentDto.name}" already exists`,
        );
      }
    }

    // Validate head if provided
    if (updateDepartmentDto.headId) {
      const head = await this.prisma.employee.findUnique({
        where: { id: updateDepartmentDto.headId },
      });
      if (!head) {
        throw new BadRequestException('Invalid head employee ID');
      }
    }

    const updatedDepartment = await this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    this.logger.log(`Department updated: ${id}`);

    return updatedDepartment;
  }

  async remove(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    if (department._count.employees > 0) {
      throw new BadRequestException(
        'Cannot delete department with employees. Please reassign employees first.',
      );
    }

    await this.prisma.department.delete({
      where: { id },
    });

    this.logger.log(`Department deleted: ${id}`);

    return { message: 'Department deleted successfully' };
  }

  async assignHead(id: string, headId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const head = await this.prisma.employee.findUnique({
      where: { id: headId },
    });

    if (!head) {
      throw new NotFoundException(`Employee with ID ${headId} not found`);
    }

    // Check if employee is already head of another department
    const existingHeadDept = await this.prisma.department.findFirst({
      where: {
        headId,
        id: { not: id },
      },
    });

    if (existingHeadDept) {
      throw new BadRequestException(
        `Employee is already head of department: ${existingHeadDept.name}`,
      );
    }

    const updatedDepartment = await this.prisma.department.update({
      where: { id },
      data: { headId },
      include: {
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    this.logger.log(`Head ${headId} assigned to department ${id}`);

    return updatedDepartment;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  HrRepository,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeFilters,
} from './hr.repository';
import type { EmployeeSnapshot } from '../domain/employee.domain';
import type { AttendanceSnapshot } from '../domain/attendance.domain';
import type { LeaveRequestSnapshot, LeaveType } from '../domain/leave.domain';
import type {
  DepartmentSnapshot,
  DesignationSnapshot,
} from '../domain/reference.domain';
import { DatabaseError } from '../domain/hr.errors';

@Injectable()
export class PrismaHrRepository implements HrRepository {
  private readonly logger = new Logger(PrismaHrRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(data: CreateEmployeeData): Promise<EmployeeSnapshot> {
    try {
      const employee = await this.prisma.employee.create({
        data: {
          userId: data.userId,
          employeeCode: data.employeeCode,
          firstName: data.firstName,
          lastName: data.lastName,
          departmentId: data.departmentId,
          designationId: data.designationId,
          joinDate: data.joinDate,
          status: 'active',
        },
        include: {
          department: true,
          designation: true,
        },
      });

      return this.mapToEmployeeSnapshot(employee);
    } catch (error) {
      this.logger.error(
        `Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('createEmployee', error as Error);
    }
  }

  async findEmployeeById(id: string): Promise<EmployeeSnapshot | null> {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { id },
        include: {
          department: true,
          designation: true,
        },
      });

      return employee ? this.mapToEmployeeSnapshot(employee) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find employee by ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('findEmployeeById', error as Error);
    }
  }

  async findEmployeeByCode(code: string): Promise<EmployeeSnapshot | null> {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { employeeCode: code },
        include: {
          department: true,
          designation: true,
        },
      });

      return employee ? this.mapToEmployeeSnapshot(employee) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find employee by code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('findEmployeeByCode', error as Error);
    }
  }

  async findEmployeeByUserId(userId: string): Promise<EmployeeSnapshot | null> {
    try {
      const employee = await this.prisma.employee.findFirst({
        where: { userId },
        include: {
          department: true,
          designation: true,
        },
      });

      return employee ? this.mapToEmployeeSnapshot(employee) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find employee by user ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('findEmployeeByUserId', error as Error);
    }
  }

  async listEmployees(filters?: EmployeeFilters): Promise<EmployeeSnapshot[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.departmentId) {
        where.departmentId = filters.departmentId;
      }

      if (filters?.designationId) {
        where.designationId = filters.designationId;
      }

      if (filters?.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { employeeCode: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const employees = await this.prisma.employee.findMany({
        where,
        include: {
          department: true,
          designation: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return employees.map(this.mapToEmployeeSnapshot);
    } catch (error) {
      this.logger.error(
        `Failed to list employees: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('listEmployees', error as Error);
    }
  }

  async updateEmployee(
    id: string,
    data: UpdateEmployeeData,
  ): Promise<EmployeeSnapshot> {
    try {
      const employee = await this.prisma.employee.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          departmentId: data.departmentId,
          designationId: data.designationId,
          status: data.status,
        },
        include: {
          department: true,
          designation: true,
        },
      });

      return this.mapToEmployeeSnapshot(employee);
    } catch (error) {
      this.logger.error(
        `Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('updateEmployee', error as Error);
    }
  }

  async softDeleteEmployee(id: string): Promise<void> {
    try {
      await this.prisma.employee.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'inactive',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to soft delete employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('softDeleteEmployee', error as Error);
    }
  }

  async employeeCodeExists(code: string): Promise<boolean> {
    try {
      const count = await this.prisma.employee.count({
        where: { employeeCode: code },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check employee code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('employeeCodeExists', error as Error);
    }
  }

  async listDepartments(): Promise<DepartmentSnapshot[]> {
    try {
      const departments = await this.prisma.department.findMany({
        orderBy: { name: 'asc' },
      });

      return departments.map(this.mapToDepartmentSnapshot);
    } catch (error) {
      this.logger.error(
        `Failed to list departments: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('listDepartments', error as Error);
    }
  }

  async findDepartmentById(id: string): Promise<DepartmentSnapshot | null> {
    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
      });

      return department ? this.mapToDepartmentSnapshot(department) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find department: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('findDepartmentById', error as Error);
    }
  }

  async listDesignations(): Promise<DesignationSnapshot[]> {
    try {
      const designations = await this.prisma.designation.findMany({
        orderBy: { title: 'asc' },
      });

      return designations.map(this.mapToDesignationSnapshot);
    } catch (error) {
      this.logger.error(
        `Failed to list designations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('listDesignations', error as Error);
    }
  }

  async findDesignationById(id: string): Promise<DesignationSnapshot | null> {
    try {
      const designation = await this.prisma.designation.findUnique({
        where: { id },
      });

      return designation ? this.mapToDesignationSnapshot(designation) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find designation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('findDesignationById', error as Error);
    }
  }

  private mapToEmployeeSnapshot(employee: any): EmployeeSnapshot {
    return {
      id: employee.id,
      userId: employee.userId,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: employee.departmentId,
      designationId: employee.designationId,
      joinDate: employee.joinDate,
      status: employee.status,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      deletedAt: employee.deletedAt,
    };
  }

  private mapToDepartmentSnapshot(department: any): DepartmentSnapshot {
    return {
      id: department.id,
      name: department.name,
      description: department.description,
    };
  }

  private mapToDesignationSnapshot(designation: any): DesignationSnapshot {
    return {
      id: designation.id,
      title: designation.title,
    };
  }

  // Attendance operations
  async createAttendance(data: {
    employeeId: string;
    attendanceDate: Date;
    checkIn: Date;
    status: 'present' | 'late' | 'half-day';
    notes?: string;
  }): Promise<AttendanceSnapshot> {
    try {
      const attendance = await this.prisma.attendance.create({
        data: {
          employeeId: data.employeeId,
          attendanceDate: data.attendanceDate,
          checkIn: data.checkIn,
          status: data.status,
          notes: data.notes,
        },
      });

      return this.mapToAttendanceSnapshot(attendance);
    } catch (error) {
      this.logger.error(
        `Failed to create attendance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('createAttendance', error as Error);
    }
  }

  async findAttendanceById(id: string): Promise<AttendanceSnapshot | null> {
    try {
      const attendance = await this.prisma.attendance.findUnique({
        where: { id },
      });

      return attendance ? this.mapToAttendanceSnapshot(attendance) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find attendance by ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('findAttendanceById', error as Error);
    }
  }

  async findAttendanceByEmployeeAndDate(
    employeeId: string,
    date: Date,
  ): Promise<AttendanceSnapshot | null> {
    try {
      // Normalize date to start of day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const attendance = await this.prisma.attendance.findFirst({
        where: {
          employeeId,
          attendanceDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      return attendance ? this.mapToAttendanceSnapshot(attendance) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find attendance by employee and date: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError(
        'findAttendanceByEmployeeAndDate',
        error as Error,
      );
    }
  }

  async listAttendanceByEmployee(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceSnapshot[]> {
    try {
      const attendances = await this.prisma.attendance.findMany({
        where: {
          employeeId,
          attendanceDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { attendanceDate: 'desc' },
      });

      return attendances.map(this.mapToAttendanceSnapshot);
    } catch (error) {
      this.logger.error(
        `Failed to list attendance by employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('listAttendanceByEmployee', error as Error);
    }
  }

  async listAttendanceByDate(date: Date): Promise<AttendanceSnapshot[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const attendances: any[] = await this.prisma.attendance.findMany({
        where: {
          attendanceDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return attendances.map(this.mapToAttendanceSnapshot);
    } catch (error) {
      this.logger.error(
        `Failed to list attendance by date: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('listAttendanceByDate', error as Error);
    }
  }

  async listAllAttendance(
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceSnapshot[]> {
    try {
      const attendances = await this.prisma.attendance.findMany({
        where: {
          attendanceDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { attendanceDate: 'desc' },
        include: {
          employee: true,
        },
      });

      return attendances.map(this.mapToAttendanceSnapshot);
    } catch (error) {
      this.logger.error(
        `Failed to list all attendance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('listAllAttendance', error as Error);
    }
  }

  async updateAttendance(
    id: string,
    data: {
      checkOut?: Date;
      status?: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
      workHours?: number;
      overtimeHours?: number;
      notes?: string;
      isManualEntry?: boolean;
    },
  ): Promise<AttendanceSnapshot> {
    try {
      const attendance = await this.prisma.attendance.update({
        where: { id },
        data: {
          checkOut: data.checkOut,
          status: data.status,
          workHours: data.workHours,
          overtimeHours: data.overtimeHours,
          notes: data.notes,
          isManualEntry: data.isManualEntry,
        },
      });

      return this.mapToAttendanceSnapshot(attendance);
    } catch (error) {
      this.logger.error(
        `Failed to update attendance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('updateAttendance', error as Error);
    }
  }

  async deleteAttendance(id: string): Promise<void> {
    try {
      await this.prisma.attendance.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete attendance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('deleteAttendance', error as Error);
    }
  }

  async findEmployeesWithoutAttendance(date: Date): Promise<string[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all active employees
      const allEmployees = await this.prisma.employee.findMany({
        where: {
          status: 'active',
          deletedAt: null,
        },
        select: { id: true },
      });

      // Get employees who have attendance for this date
      const employeesWithAttendance = await this.prisma.attendance.findMany({
        where: {
          attendanceDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: { employeeId: true },
      });

      const attendedIds = new Set(
        employeesWithAttendance.map(
          (a: { employeeId: string }) => a.employeeId,
        ),
      );

      return allEmployees
        .filter((e: { id: string }) => !attendedIds.has(e.id))
        .map((e: { id: string }) => e.id);
    } catch (error) {
      this.logger.error(
        `Failed to find employees without attendance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('findEmployeesWithoutAttendance', error as Error);
    }
  }

  private mapToAttendanceSnapshot(attendance: any): AttendanceSnapshot {
    return {
      id: attendance.id,
      employeeId: attendance.employeeId,
      attendanceDate: attendance.attendanceDate,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status,
      workHours: attendance.workHours,
      overtimeHours: attendance.overtimeHours,
      isManualEntry: attendance.isManualEntry,
      notes: attendance.notes,
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
    };
  }

  // Leave request operations
  async createLeaveRequest(data: {
    employeeId: string;
    startDate: Date;
    endDate: Date;
    leaveType: LeaveType;
    reason?: string;
  }): Promise<LeaveRequestSnapshot> {
    try {
      const leaveRequest = await this.prisma.leaveRequest.create({
        data: {
          employeeId: data.employeeId,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'pending',
        },
        include: {
          employee: true,
        },
      });

      return this.mapToLeaveRequestSnapshot(leaveRequest);
    } catch (error) {
      this.logger.error(
        `Failed to create leave request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('createLeaveRequest', error as Error);
    }
  }

  async findLeaveRequestById(id: string): Promise<LeaveRequestSnapshot | null> {
    try {
      const leaveRequest = await this.prisma.leaveRequest.findUnique({
        where: { id },
        include: {
          employee: true,
        },
      });

      return leaveRequest ? this.mapToLeaveRequestSnapshot(leaveRequest) : null;
    } catch (error) {
      this.logger.error(
        `Failed to find leave request by ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('findLeaveRequestById', error as Error);
    }
  }

  async listLeaveRequests(filters?: {
    employeeId?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    startDateFrom?: Date;
    startDateTo?: Date;
    leaveType?: LeaveType;
  }): Promise<LeaveRequestSnapshot[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filters?.employeeId) {
        where.employeeId = filters.employeeId;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.startDateFrom || filters?.startDateTo) {
        where.startDate = {};
        if (filters.startDateFrom) {
          (where.startDate as Record<string, Date>).gte = filters.startDateFrom;
        }
        if (filters.startDateTo) {
          (where.startDate as Record<string, Date>).lte = filters.startDateTo;
        }
      }

      const leaveRequests = await this.prisma.leaveRequest.findMany({
        where,
        include: {
          employee: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return leaveRequests.map(this.mapToLeaveRequestSnapshot);
    } catch (error) {
      this.logger.error(
        `Failed to list leave requests: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('listLeaveRequests', error as Error);
    }
  }

  async listLeaveRequestsForYear(
    employeeId: string,
    year: number,
  ): Promise<LeaveRequestSnapshot[]> {
    try {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

      const leaveRequests = await this.prisma.leaveRequest.findMany({
        where: {
          employeeId,
          startDate: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        include: {
          employee: true,
        },
        orderBy: { startDate: 'desc' },
      });

      return leaveRequests.map(this.mapToLeaveRequestSnapshot);
    } catch (error) {
      this.logger.error(
        `Failed to list leave requests for year: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('listLeaveRequestsForYear', error as Error);
    }
  }

  async updateLeaveRequestStatus(
    leaveRequestId: string,
    status: 'approved' | 'rejected' | 'cancelled',
  ): Promise<LeaveRequestSnapshot> {
    try {
      const workflowState =
        status === 'approved'
          ? 'APPROVED'
          : status === 'rejected'
            ? 'REJECTED'
            : null;

      const leaveRequest = await this.prisma.leaveRequest.update({
        where: {
          id: leaveRequestId,
        },
        data: {
          status,
          workflowState,
        },
        include: {
          employee: true,
        },
      });

      return this.mapToLeaveRequestSnapshot(leaveRequest);
    } catch (error: unknown) {
      this.logger.error('Failed to update leave request status', error);

      throw new DatabaseError('updateLeaveRequestStatus', error as Error);
    }
  }

  async hasOverlappingLeaveRequest(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<boolean> {
    try {
      const where: Record<string, unknown> = {
        employeeId,
        status: {
          notIn: ['rejected', 'cancelled'],
        },
        OR: [
          {
            // New request starts during an existing request
            startDate: {
              lte: endDate,
            },
            endDate: {
              gte: startDate,
            },
          },
        ],
      };

      if (excludeId) {
        where.id = {
          not: excludeId,
        };
      }

      const count = await this.prisma.leaveRequest.count({ where });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check overlapping leave requests: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseError('hasOverlappingLeaveRequest', error as Error);
    }
  }

  private mapToLeaveRequestSnapshot(leaveRequest: any): LeaveRequestSnapshot {
    return {
      id: leaveRequest.id,
      employeeId: leaveRequest.employeeId,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      leaveType: leaveRequest.leaveType || 'other',
      reason: leaveRequest.reason,
      status: leaveRequest.status,
      createdAt: leaveRequest.createdAt,
      updatedAt: leaveRequest.updatedAt,
    };
  }
}

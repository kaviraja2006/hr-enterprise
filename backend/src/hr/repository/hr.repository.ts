import { EmployeeData, EmployeeSnapshot } from '../domain/employee.domain';
import type { AttendanceSnapshot } from '../domain/attendance.domain';
import type { LeaveRequestSnapshot, LeaveType } from '../domain/leave.domain';
import {
  DepartmentSnapshot,
  DesignationSnapshot,
} from '../domain/reference.domain';

export interface CreateEmployeeData extends EmployeeData {
  createdBy?: string;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  departmentId?: string;
  designationId?: string;
  status?: 'active' | 'inactive';
}

export interface EmployeeFilters {
  status?: 'active' | 'inactive';
  departmentId?: string;
  designationId?: string;
  search?: string;
}

export interface HrRepository {
  // Employee operations
  createEmployee(data: CreateEmployeeData): Promise<EmployeeSnapshot>;
  findEmployeeById(id: string): Promise<EmployeeSnapshot | null>;
  findEmployeeByCode(code: string): Promise<EmployeeSnapshot | null>;
  findEmployeeByUserId(userId: string): Promise<EmployeeSnapshot | null>;
  listEmployees(filters?: EmployeeFilters): Promise<EmployeeSnapshot[]>;
  updateEmployee(
    id: string,
    data: UpdateEmployeeData,
  ): Promise<EmployeeSnapshot>;
  softDeleteEmployee(id: string): Promise<void>;
  employeeCodeExists(code: string): Promise<boolean>;

  // Reference data
  listDepartments(): Promise<DepartmentSnapshot[]>;
  findDepartmentById(id: string): Promise<DepartmentSnapshot | null>;
  listDesignations(): Promise<DesignationSnapshot[]>;
  findDesignationById(id: string): Promise<DesignationSnapshot | null>;

  // Attendance operations
  createAttendance(data: {
    employeeId: string;
    attendanceDate: Date;
    checkIn?: Date;
    status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
    notes?: string;
  }): Promise<AttendanceSnapshot>;
  findAttendanceById(id: string): Promise<AttendanceSnapshot | null>;
  findAttendanceByEmployeeAndDate(
    employeeId: string,
    date: Date,
  ): Promise<AttendanceSnapshot | null>;
  listAttendanceByEmployee(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceSnapshot[]>;
  listAttendanceByDate(date: Date): Promise<AttendanceSnapshot[]>;
  listAllAttendance(
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceSnapshot[]>;
  updateAttendance(
    id: string,
    data: {
      checkOut?: Date;
      status?: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
      workHours?: number;
      overtimeHours?: number;
      notes?: string;
      isManualEntry?: boolean;
    },
  ): Promise<AttendanceSnapshot>;
  deleteAttendance(id: string): Promise<void>;
  findEmployeesWithoutAttendance(date: Date): Promise<string[]>; // Returns employee IDs

  // Leave request operations
  createLeaveRequest(data: {
    employeeId: string;
    startDate: Date;
    endDate: Date;
    leaveType: LeaveType;
    reason?: string;
  }): Promise<LeaveRequestSnapshot>;
  findLeaveRequestById(id: string): Promise<LeaveRequestSnapshot | null>;
  listLeaveRequests(filters?: {
    employeeId?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    startDateFrom?: Date;
    startDateTo?: Date;
    leaveType?: LeaveType;
  }): Promise<LeaveRequestSnapshot[]>;
  listLeaveRequestsForYear(
    employeeId: string,
    year: number,
  ): Promise<LeaveRequestSnapshot[]>;
  updateLeaveRequestStatus(
    id: string,
    status: 'approved' | 'rejected' | 'cancelled',
  ): Promise<LeaveRequestSnapshot>;
  hasOverlappingLeaveRequest(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<boolean>;
}

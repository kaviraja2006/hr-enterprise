import { Injectable, Logger, Inject } from '@nestjs/common';
import type { HrRepository } from '../repository/hr.repository';
import type {
  AttendanceSnapshot,
  AttendanceSummary,
} from '../domain/attendance.domain';
import {
  AttendanceNotFoundError,
  AttendanceAlreadyExistsError,
  NoCheckInRecordError,
} from '../domain/hr.errors';
import { AttendanceDomain } from '../domain/attendance.domain';

export interface CheckInInput {
  employeeId: string;
  timestamp?: string;
  notes?: string;
}

export interface CheckOutInput {
  attendanceId: string;
  timestamp?: string;
  notes?: string;
}

export interface AttendanceUpdateInput {
  checkOut?: Date;
  status?: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  workHours?: number;
  overtimeHours?: number;
  notes?: string;
  isManualEntry?: boolean;
}

export interface AttendanceQuery {
  employeeId?: string;
  date?: string;
  status?: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class AttendanceApplicationService {
  private readonly logger = new Logger(AttendanceApplicationService.name);

  constructor(
    @Inject('HrRepository')
    private readonly repository: HrRepository,
  ) {}

  async checkIn(input: CheckInInput): Promise<AttendanceSnapshot> {
    this.logger.debug(`Checking in employee: ${input.employeeId}`);

    const checkInDate = AttendanceDomain.validateCheckIn(
      input.employeeId,
      input.timestamp ? new Date(input.timestamp) : undefined,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance =
      await this.repository.findAttendanceByEmployeeAndDate(
        input.employeeId,
        today,
      );

    if (existingAttendance) {
      throw new AttendanceAlreadyExistsError(
        input.employeeId,
        AttendanceDomain.getDateKeyIST(
          new Date(existingAttendance.attendanceDate),
        ),
      );
    }

    const status = AttendanceDomain.determineStatus(
      checkInDate,
      undefined,
      false,
    );

    return this.repository.createAttendance({
      employeeId: input.employeeId,
      attendanceDate: checkInDate,
      checkIn: checkInDate,
      status,
      notes: input.notes,
    });
  }

  async checkOut(input: CheckOutInput): Promise<AttendanceSnapshot> {
    this.logger.debug(`Checking out: ${input.attendanceId}`);

    const attendance = await this.repository.findAttendanceById(
      input.attendanceId,
    );
    if (!attendance) {
      throw new AttendanceNotFoundError(input.attendanceId);
    }

    if (!attendance.checkIn) {
      throw new NoCheckInRecordError(attendance.employeeId);
    }

    const checkOutDate = AttendanceDomain.validateCheckOut(
      input.attendanceId,
      attendance.checkIn,
      input.timestamp ? new Date(input.timestamp) : undefined,
    );

    const workHours = AttendanceDomain.calculateWorkHours(
      attendance.checkIn,
      checkOutDate,
    );
    const overtime = AttendanceDomain.calculateOvertime(workHours);
    const status = AttendanceDomain.determineStatus(
      attendance.checkIn,
      checkOutDate,
      false,
    );

    const updateData: AttendanceUpdateInput = {
      checkOut: checkOutDate,
      status,
      workHours,
      overtimeHours: overtime,
      notes: input.notes,
    };

    return this.repository.updateAttendance(input.attendanceId, updateData);
  }

  async getEmployeeAttendance(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceSnapshot[]> {
    this.logger.debug(`Getting attendance for employee ${employeeId}`);

    AttendanceDomain.validateDateRange(startDate, endDate);

    const attendances = await this.repository.listAttendanceByEmployee(
      employeeId,
      startDate,
      endDate,
    );

    return attendances;
  }

  async getDailyAttendance(date: Date): Promise<AttendanceSnapshot[]> {
    this.logger.debug(`Getting daily attendance for ${date.toISOString()}`);

    const attendances = await this.repository.listAttendanceByDate(date);
    return attendances;
  }

  async getAttendanceSummary(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceSummary> {
    this.logger.debug(`Calculating attendance summary for ${employeeId}`);

    AttendanceDomain.validateDateRange(startDate, endDate);

    const attendances = await this.repository.listAttendanceByEmployee(
      employeeId,
      startDate,
      endDate,
    );

    return AttendanceDomain.calculateSummary(attendances);
  }

  async updateAttendance(
    attendanceId: string,
    isManualEntry = false,
    input: AttendanceUpdateInput,
  ): Promise<AttendanceSnapshot> {
    this.logger.debug(`Updating attendance: ${attendanceId}`);

    const attendance = await this.repository.findAttendanceById(attendanceId);
    if (!attendance) {
      throw new AttendanceNotFoundError(attendanceId);
    }

    const updateData: AttendanceUpdateInput = { isManualEntry };

    if (input.status) {
      updateData.status = input.status;
    }

    if (input.notes) {
      updateData.notes = input.notes;
    }

    return this.repository.updateAttendance(attendanceId, updateData);
  }
}

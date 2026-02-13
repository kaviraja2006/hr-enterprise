import { InvalidAttendanceDataError } from './hr.errors';

// IST timezone offset from UTC (India Standard Time: UTC+5:30)
const IST_OFFSET_MINUTES = 330; // 5 hours 30 minutes

// Business constants
const LATE_THRESHOLD_HOUR = 9;
const LATE_THRESHOLD_MINUTE = 15;
const STANDARD_WORK_HOURS = 8;

export interface AttendanceData {
  employeeId: string;
  attendanceDate: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  workHours?: number;
  overtimeHours?: number;
  notes?: string;
}

export interface AttendanceSnapshot extends AttendanceData {
  id: string;
  isManualEntry: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSummary {
  employeeId: string;
  totalDays: number;
  present: number;
  late: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
}

export class AttendanceDomain {
  // Convert UTC to IST
  static toIST(date: Date): Date {
    return new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  }

  // Convert IST to UTC
  static toUTC(date: Date): Date {
    return new Date(date.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
  }

  // Get current time in IST
  static getCurrentIST(): Date {
    return this.toIST(new Date());
  }

  // Check if a date is weekend (Saturday = 6, Sunday = 0 in IST)
  static isWeekend(date: Date): boolean {
    const istDate = this.toIST(date);
    const day = istDate.getDay();
    return day === 0 || day === 6;
  }

  // Check if time is late (after 9:15 AM IST)
  static isLate(checkIn: Date): boolean {
    const istCheckIn = this.toIST(checkIn);
    const hour = istCheckIn.getHours();
    const minute = istCheckIn.getMinutes();

    // Late if after 9:15 AM
    if (hour > LATE_THRESHOLD_HOUR) return true;
    if (hour === LATE_THRESHOLD_HOUR && minute > LATE_THRESHOLD_MINUTE)
      return true;
    return false;
  }

  // Calculate work hours between check-in and check-out
  static calculateWorkHours(checkIn: Date, checkOut: Date): number {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  }

  // Calculate overtime (hours > 8)
  static calculateOvertime(workHours: number): number {
    if (workHours <= STANDARD_WORK_HOURS) return 0;
    return Math.round((workHours - STANDARD_WORK_HOURS) * 100) / 100;
  }

  // Determine attendance status based on check-in time and work hours
  static determineStatus(
    checkIn: Date,
    checkOut?: Date,
    isManualEntry = false,
  ): 'present' | 'late' | 'half-day' {
    // If manual entry by HR, respect the manual status
    if (isManualEntry) {
      return 'present'; // Default, can be overridden
    }

    // Check if late
    if (this.isLate(checkIn)) {
      return 'late';
    }

    // If checked out, determine if half-day (less than 4 hours)
    if (checkOut) {
      const workHours = this.calculateWorkHours(checkIn, checkOut);
      if (workHours < 4) {
        return 'half-day';
      }
    }

    return 'present';
  }

  // Validate check-in data
  static validateCheckIn(employeeId: string, timestamp?: Date): Date {
    if (!employeeId || employeeId.trim().length === 0) {
      throw new InvalidAttendanceDataError(
        'Employee ID is required',
        'employeeId',
      );
    }

    // Use provided timestamp or current time
    const checkInTime = timestamp ? new Date(timestamp) : new Date();

    // Validate it's not a future date
    const now = new Date();
    if (checkInTime > now) {
      throw new InvalidAttendanceDataError(
        'Check-in time cannot be in the future',
        'timestamp',
      );
    }

    return checkInTime;
  }

  // Validate check-out data
  static validateCheckOut(
    attendanceId: string,
    checkIn: Date,
    timestamp?: Date,
  ): Date {
    if (!attendanceId || attendanceId.trim().length === 0) {
      throw new InvalidAttendanceDataError(
        'Attendance ID is required',
        'attendanceId',
      );
    }

    // Use provided timestamp or current time
    const checkOutTime = timestamp ? new Date(timestamp) : new Date();

    // Validate check-out is after check-in
    if (checkOutTime <= checkIn) {
      throw new InvalidAttendanceDataError(
        'Check-out time must be after check-in time',
        'timestamp',
      );
    }

    // Validate it's not a future date (allow 5 min buffer for clock skew)
    const now = new Date();
    const bufferMs = 5 * 60 * 1000; // 5 minutes
    if (checkOutTime.getTime() > now.getTime() + bufferMs) {
      throw new InvalidAttendanceDataError(
        'Check-out time cannot be in the future',
        'timestamp',
      );
    }

    return checkOutTime;
  }

  // Get the date key (YYYY-MM-DD) in IST for a given timestamp
  static getDateKeyIST(date: Date): string {
    const ist = this.toIST(date);
    return ist.toISOString().split('T')[0];
  }

  // Validate date range for queries
  static validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
      throw new InvalidAttendanceDataError(
        'Start date must be before or equal to end date',
      );
    }

    const maxRangeDays = 365;
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > maxRangeDays) {
      throw new InvalidAttendanceDataError(
        `Date range cannot exceed ${maxRangeDays} days`,
        'dateRange',
      );
    }
  }

  // Calculate summary statistics
  static calculateSummary(
    attendances: AttendanceSnapshot[],
  ): AttendanceSummary {
    const employeeId = attendances[0]?.employeeId || '';

    let present = 0;
    let late = 0;
    let absent = 0;
    let halfDay = 0;
    let onLeave = 0;
    let totalWorkHours = 0;
    let totalOvertimeHours = 0;

    for (const attendance of attendances) {
      switch (attendance.status) {
        case 'present':
          present++;
          break;
        case 'late':
          late++;
          break;
        case 'absent':
          absent++;
          break;
        case 'half-day':
          halfDay++;
          break;
        case 'on-leave':
          onLeave++;
          break;
      }

      if (attendance.workHours) {
        totalWorkHours += attendance.workHours;
      }
      if (attendance.overtimeHours) {
        totalOvertimeHours += attendance.overtimeHours;
      }
    }

    return {
      employeeId,
      totalDays: attendances.length,
      present,
      late,
      absent,
      halfDay,
      onLeave,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
    };
  }
}

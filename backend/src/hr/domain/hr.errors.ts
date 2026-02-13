import { DomainError } from '@zippy/errors';

// Domain Errors - Business rule violations
export class EmployeeNotFoundError extends DomainError {
  constructor(employeeId: string) {
    super('EMPLOYEE_NOT_FOUND', `Employee with ID ${employeeId} not found`, {
      employeeId,
    });
  }
}

export class EmployeeCodeAlreadyExistsError extends DomainError {
  constructor(employeeCode: string) {
    super(
      'EMPLOYEE_CODE_EXISTS',
      `Employee code ${employeeCode} already exists`,
      { employeeCode },
    );
  }
}

export class InvalidEmployeeDataError extends DomainError {
  constructor(message: string, field?: string) {
    super('INVALID_EMPLOYEE_DATA', message, field ? { field } : undefined);
  }
}

export class DepartmentNotFoundError extends DomainError {
  constructor(departmentId: string) {
    super(
      'DEPARTMENT_NOT_FOUND',
      `Department with ID ${departmentId} not found`,
      {
        departmentId,
      },
    );
  }
}

export class DesignationNotFoundError extends DomainError {
  constructor(designationId: string) {
    super(
      'DESIGNATION_NOT_FOUND',
      `Designation with ID ${designationId} not found`,
      { designationId },
    );
  }
}

// Leave Errors
export class LeaveRequestNotFoundError extends DomainError {
  constructor(leaveRequestId: string) {
    super(
      'LEAVE_REQUEST_NOT_FOUND',
      `Leave request with ID ${leaveRequestId} not found`,
      { leaveRequestId },
    );
  }
}

export class LeaveRequestAlreadyExistsError extends DomainError {
  constructor(employeeId: string, startDate: string, endDate: string) {
    super(
      'LEAVE_REQUEST_ALREADY_EXISTS',
      `Leave request already exists for employee ${employeeId} from ${startDate} to ${endDate}`,
      { employeeId, startDate, endDate },
    );
  }
}

export class InvalidLeaveRequestError extends DomainError {
  constructor(message: string, field?: string) {
    super('INVALID_LEAVE_REQUEST', message, field ? { field } : undefined);
  }
}

export class LeaveRequestAlreadyProcessedError extends DomainError {
  constructor(leaveRequestId: string, currentStatus: string) {
    super(
      'LEAVE_REQUEST_ALREADY_PROCESSED',
      `Leave request ${leaveRequestId} has already been ${currentStatus}`,
      { leaveRequestId, currentStatus },
    );
  }
}

export class InsufficientLeaveBalanceError extends DomainError {
  constructor(
    employeeId: string,
    requestedDays: number,
    availableDays: number,
  ) {
    super(
      'INSUFFICIENT_LEAVE_BALANCE',
      `Employee ${employeeId} has insufficient leave balance. Requested: ${requestedDays}, Available: ${availableDays}`,
      { employeeId, requestedDays, availableDays },
    );
  }
}

// Attendance Errors
export class AttendanceNotFoundError extends DomainError {
  constructor(attendanceId: string) {
    super(
      'ATTENDANCE_NOT_FOUND',
      `Attendance record with ID ${attendanceId} not found`,
      { attendanceId },
    );
  }
}

export class AttendanceAlreadyExistsError extends DomainError {
  constructor(employeeId: string, date: string) {
    super(
      'ATTENDANCE_ALREADY_EXISTS',
      `Attendance already recorded for employee ${employeeId} on ${date}`,
      { employeeId, date },
    );
  }
}

export class NoCheckInRecordError extends DomainError {
  constructor(employeeId: string) {
    super(
      'NO_CHECK_IN_RECORD',
      `No check-in record found for employee ${employeeId}`,
      { employeeId },
    );
  }
}

export class InvalidAttendanceDataError extends DomainError {
  constructor(message: string, field?: string) {
    super('INVALID_ATTENDANCE_DATA', message, field ? { field } : undefined);
  }
}

// Infrastructure Errors - Database/technical failures
export class DatabaseError extends DomainError {
  constructor(operation: string, cause?: Error) {
    super(
      'DATABASE_ERROR',
      `Database operation failed: ${operation}`,
      cause ? { cause: cause.message } : undefined,
    );
  }
}

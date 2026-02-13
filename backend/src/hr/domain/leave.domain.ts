import { InvalidLeaveRequestError } from './hr.errors';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveType =
  | 'annual'
  | 'sick'
  | 'casual'
  | 'maternity'
  | 'paternity'
  | 'bereavement'
  | 'unpaid'
  | 'other';

export interface LeaveRequestData {
  employeeId: string;
  startDate: Date;
  endDate: Date;
  leaveType: LeaveType;
  reason?: string;
}

export interface LeaveRequestSnapshot extends LeaveRequestData {
  id: string;
  status: LeaveStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  employeeId: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveSummary {
  employeeId: string;
  year: number;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  pendingRequests: number;
  totalDaysTaken: number;
  byType: Record<LeaveType, number>;
}

export class LeaveDomain {
  // Calculate number of days between start and end date (inclusive)
  static calculateLeaveDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Reset time to midnight for accurate day calculation
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Add 1 to include both start and end dates
    return diffDays + 1;
  }

  // Validate leave request data
  static validateLeaveRequest(data: LeaveRequestData): void {
    this.validateEmployeeId(data.employeeId);
    this.validateDateRange(data.startDate, data.endDate);
    this.validateLeaveType(data.leaveType);

    if (data.reason !== undefined && data.reason.length > 500) {
      throw new InvalidLeaveRequestError(
        'Reason cannot exceed 500 characters',
        'reason',
      );
    }
  }

  static validateEmployeeId(employeeId: string): void {
    if (!employeeId || employeeId.trim().length === 0) {
      throw new InvalidLeaveRequestError(
        'Employee ID is required',
        'employeeId',
      );
    }
  }

  static validateDateRange(startDate: Date, endDate: Date): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Reset time for comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      throw new InvalidLeaveRequestError(
        'Start date cannot be in the past',
        'startDate',
      );
    }

    if (end < start) {
      throw new InvalidLeaveRequestError(
        'End date cannot be before start date',
        'endDate',
      );
    }

    const maxDays = 365;
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > maxDays) {
      throw new InvalidLeaveRequestError(
        `Leave request cannot exceed ${maxDays} days`,
        'dateRange',
      );
    }
  }

  static validateLeaveType(leaveType: string): void {
    const validTypes: LeaveType[] = [
      'annual',
      'sick',
      'casual',
      'maternity',
      'paternity',
      'bereavement',
      'unpaid',
      'other',
    ];

    if (!validTypes.includes(leaveType as LeaveType)) {
      throw new InvalidLeaveRequestError(
        `Invalid leave type. Must be one of: ${validTypes.join(', ')}`,
        'leaveType',
      );
    }
  }

  // Check if leave request can be approved/rejected
  static canProcess(currentStatus: LeaveStatus): {
    canProcess: boolean;
    reason?: string;
  } {
    if (currentStatus === 'approved') {
      return { canProcess: false, reason: 'Leave request is already approved' };
    }

    if (currentStatus === 'rejected') {
      return { canProcess: false, reason: 'Leave request is already rejected' };
    }

    if (currentStatus === 'cancelled') {
      return { canProcess: false, reason: 'Leave request has been cancelled' };
    }

    return { canProcess: true };
  }

  // Check if leave request can be cancelled
  static canCancel(currentStatus: LeaveStatus): {
    canCancel: boolean;
    reason?: string;
  } {
    if (currentStatus === 'approved') {
      return {
        canCancel: false,
        reason: 'Cannot cancel an already approved leave request',
      };
    }

    if (currentStatus === 'rejected') {
      return {
        canCancel: false,
        reason: 'Cannot cancel an already rejected leave request',
      };
    }

    if (currentStatus === 'cancelled') {
      return { canCancel: true }; // Idempotent: already cancelled, no-op
    }

    return { canCancel: true };
  }

  // Calculate leave summary from list of requests
  static calculateSummary(
    employeeId: string,
    requests: LeaveRequestSnapshot[],
    year: number,
  ): LeaveSummary {
    const approvedRequests = requests.filter((r) => r.status === 'approved');
    const rejectedRequests = requests.filter((r) => r.status === 'rejected');
    const pendingRequests = requests.filter((r) => r.status === 'pending');

    const totalDaysTaken = approvedRequests.reduce((total, request) => {
      return (
        total + this.calculateLeaveDays(request.startDate, request.endDate)
      );
    }, 0);

    const byType: Record<LeaveType, number> = {
      annual: 0,
      sick: 0,
      casual: 0,
      maternity: 0,
      paternity: 0,
      bereavement: 0,
      unpaid: 0,
      other: 0,
    };

    approvedRequests.forEach((request) => {
      const days = this.calculateLeaveDays(request.startDate, request.endDate);
      byType[request.leaveType] += days;
    });

    return {
      employeeId,
      year,
      totalRequests: requests.length,
      approvedRequests: approvedRequests.length,
      rejectedRequests: rejectedRequests.length,
      pendingRequests: pendingRequests.length,
      totalDaysTaken,
      byType,
    };
  }

  // Get default leave balance for a new employee
  static getDefaultLeaveBalance(
    employeeId: string,
    year: number,
  ): LeaveBalance[] {
    return [
      {
        employeeId,
        leaveType: 'annual',
        totalDays: 20,
        usedDays: 0,
        remainingDays: 20,
        year,
      },
      {
        employeeId,
        leaveType: 'sick',
        totalDays: 10,
        usedDays: 0,
        remainingDays: 10,
        year,
      },
      {
        employeeId,
        leaveType: 'casual',
        totalDays: 5,
        usedDays: 0,
        remainingDays: 5,
        year,
      },
      {
        employeeId,
        leaveType: 'maternity',
        totalDays: 180,
        usedDays: 0,
        remainingDays: 180,
        year,
      },
      {
        employeeId,
        leaveType: 'paternity',
        totalDays: 15,
        usedDays: 0,
        remainingDays: 15,
        year,
      },
      {
        employeeId,
        leaveType: 'bereavement',
        totalDays: 5,
        usedDays: 0,
        remainingDays: 5,
        year,
      },
      {
        employeeId,
        leaveType: 'unpaid',
        totalDays: 365,
        usedDays: 0,
        remainingDays: 365,
        year,
      },
      {
        employeeId,
        leaveType: 'other',
        totalDays: 0,
        usedDays: 0,
        remainingDays: 0,
        year,
      },
    ];
  }
}

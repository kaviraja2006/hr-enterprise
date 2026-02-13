import { Injectable, Inject } from '@nestjs/common';
import type { HrRepository } from '../repository/hr.repository';
import {
  LeaveRequestNotFoundError,
  LeaveRequestAlreadyProcessedError,
  InvalidLeaveRequestError,
} from '../domain/hr.errors';
import {
  LeaveDomain,
  type LeaveType,
  type LeaveRequestSnapshot,
  type LeaveSummary,
} from '../domain/leave.domain';

@Injectable()
export class LeaveApplicationService {
  constructor(
    @Inject('HrRepository')
    private readonly repository: HrRepository,
  ) {}

  async createLeaveRequest(data: {
    employeeId: string;
    startDate: Date;
    endDate: Date;
    leaveType: LeaveType;
    reason?: string;
  }): Promise<LeaveRequestSnapshot> {
    LeaveDomain.validateLeaveRequest(data);

    if (
      await this.repository.hasOverlappingLeaveRequest(
        data.employeeId,
        data.startDate,
        data.endDate,
      )
    ) {
      throw new InvalidLeaveRequestError(
        'Employee already has a leave request for this period',
        'dateRange',
      );
    }

    return this.repository.createLeaveRequest(data);
  }

  async listLeaveRequests(filters?: {
    employeeId?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    startDateFrom?: Date;
    startDateTo?: Date;
    leaveType?: LeaveType;
  }): Promise<LeaveRequestSnapshot[]> {
    return this.repository.listLeaveRequests(filters);
  }

  async getPendingLeaveRequests(): Promise<LeaveRequestSnapshot[]> {
    return this.repository.listLeaveRequests({ status: 'pending' });
  }

  async getEmployeeLeaveRequests(
    employeeId: string,
  ): Promise<LeaveRequestSnapshot[]> {
    return this.repository.listLeaveRequestsForYear(
      employeeId,
      new Date().getFullYear(),
    );
  }

  async getLeaveSummary(
    employeeId: string,
    year: number,
  ): Promise<LeaveSummary> {
    const requests = await this.repository.listLeaveRequestsForYear(
      employeeId,
      year,
    );
    return LeaveDomain.calculateSummary(employeeId, requests, year);
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequestSnapshot | null> {
    return this.repository.findLeaveRequestById(id);
  }

  async approveLeaveRequest(
    leaveRequestId: string,
    _approverUserId: string,
  ): Promise<void> {
    void _approverUserId;
    const leaveRequest =
      await this.repository.findLeaveRequestById(leaveRequestId);

    if (!leaveRequest) {
      throw new LeaveRequestNotFoundError(leaveRequestId);
    }

    if (leaveRequest.status !== 'pending') {
      throw new LeaveRequestAlreadyProcessedError(
        leaveRequest.id,
        leaveRequest.status,
      );
    }

    await this.repository.updateLeaveRequestStatus(leaveRequest.id, 'approved');
  }

  async rejectLeaveRequest(
    leaveRequestId: string,
    _approverUserId: string,
    _rejectionReason?: string,
  ): Promise<void> {
    void _approverUserId;
    void _rejectionReason;
    const leaveRequest =
      await this.repository.findLeaveRequestById(leaveRequestId);

    if (!leaveRequest) {
      throw new LeaveRequestNotFoundError(leaveRequestId);
    }

    if (leaveRequest.status !== 'pending') {
      throw new LeaveRequestAlreadyProcessedError(
        leaveRequest.id,
        leaveRequest.status,
      );
    }

    await this.repository.updateLeaveRequestStatus(leaveRequest.id, 'rejected');
  }

  async cancelLeaveRequest(leaveRequestId: string): Promise<void> {
    const leaveRequest =
      await this.repository.findLeaveRequestById(leaveRequestId);

    if (!leaveRequest) {
      throw new LeaveRequestNotFoundError(leaveRequestId);
    }

    const { canCancel, reason } = LeaveDomain.canCancel(leaveRequest.status);
    if (!canCancel) {
      throw new InvalidLeaveRequestError(
        reason ?? 'Cannot cancel leave request',
        'status',
      );
    }

    await this.repository.updateLeaveRequestStatus(leaveRequestId, 'cancelled');
  }
}

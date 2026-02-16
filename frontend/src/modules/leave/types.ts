// Leave Types

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  annualLimit: number;
  carryForwardAllowed: boolean;
  maxCarryForward?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveType?: LeaveType;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  carriedForward: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    profilePicture?: string;
  };
  leaveTypeId: string;
  leaveType?: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedByEmployee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveListParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
}

export interface LeaveListResponse {
  data: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateLeaveRequestDto {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
}

export interface ApproveLeaveDto {
  rejectionReason?: string;
}

export interface LeaveSummary {
  year: number;
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  totalDaysTaken: number;
}

export interface CreateLeaveTypeDto {
  name: string;
  description?: string;
  annualLimit: number;
  carryForwardAllowed?: boolean;
  maxCarryForward?: number;
}

export interface UpdateLeaveTypeDto {
  name?: string;
  description?: string;
  annualLimit?: number;
  carryForwardAllowed?: boolean;
  maxCarryForward?: number;
  isActive?: boolean;
}

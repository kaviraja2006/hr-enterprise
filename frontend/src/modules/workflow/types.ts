// Workflow Types

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalStepStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  requesterId: string;
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  approverId?: string;
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: ApprovalStatus;
  currentStep: number;
  totalSteps: number;
  comments?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  steps?: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  approvalId: string;
  stepNumber: number;
  approverId: string;
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: ApprovalStepStatus;
  comments?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface CreateApprovalDto {
  entityType: string;
  entityId: string;
  approverIds: string[];
  comments?: string;
}

export interface ApproveStepDto {
  comments?: string;
}

export interface RejectApprovalDto {
  comments: string;
}

export interface ApprovalHistory {
  entityType: string;
  entityId: string;
  approvals: Approval[];
}

export interface ApprovalStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  pendingForMe: number;
  myRequestsPending: number;
}

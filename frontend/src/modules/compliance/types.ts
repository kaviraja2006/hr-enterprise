// Compliance Types

export type FilingStatus = 'pending' | 'filed' | 'acknowledged';
export type FilingType = 'PF' | 'ESI' | 'TDS' | 'GST' | 'PT' | 'ITR' | 'OTHER';

export interface FilingRecord {
  id: string;
  type: FilingType;
  period: string;
  status: FilingStatus;
  filedAt?: string;
  filedBy?: string;
  filedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  amount?: number;
  receiptNo?: string;
  notes?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyAcknowledgement {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  policyName: string;
  policyVersion?: string;
  acknowledgedAt: string;
  notes?: string;
  createdAt: string;
}

export interface CreateFilingRecordDto {
  type: FilingType;
  period: string;
  amount?: number;
  dueDate?: string;
  notes?: string;
}

export interface CreatePolicyAcknowledgementDto {
  employeeId: string;
  policyName: string;
  policyVersion?: string;
  notes?: string;
}

export interface ComplianceDashboard {
  totalFilings: number;
  pendingFilings: number;
  filedThisMonth: number;
  upcomingDue: FilingRecord[];
  recentAcknowledgements: PolicyAcknowledgement[];
}

export interface ComplianceStats {
  totalFilings: number;
  pendingFilings: number;
  filedFilings: number;
  acknowledgedFilings: number;
  upcomingDueCount: number;
  overdueCount: number;
}

export interface PolicyComplianceReport {
  policyName: string;
  totalEmployees: number;
  acknowledgedCount: number;
  pendingCount: number;
  complianceRate: number;
}

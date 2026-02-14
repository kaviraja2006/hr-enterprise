export interface ExecutiveSummary {
  // Direct fields (old format)
  totalEmployees?: number;
  activeEmployees?: number;
  newJoinings?: number;
  attritionCount?: number;
  attritionRate?: number;
  departments?: DepartmentSummary[] | number;
  attendance?: AttendanceSummary;
  leave?: LeaveSummary;
  payroll?: PayrollSummary;
  pendingApprovals?: number;
  
  // Nested fields (new backend format)
  employees?: {
    total: number;
    active: number;
    inactive: number;
  };
  recruitment?: {
    openPositions: number;
  };
}

export interface DepartmentSummary {
  id: string;
  name: string;
  employeeCount: number;
  headName?: string;
}

export interface AttendanceSummary {
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  averageWorkHours: number;
}

export interface LeaveSummary {
  pendingRequests: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
}

export interface PayrollSummary {
  totalDisbursed: number;
  averageSalary: number;
  pendingPayroll: boolean;
  nextPayrollDate?: string;
}
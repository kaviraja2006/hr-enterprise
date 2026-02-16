// Analytics Types

export interface ExecutiveSummary {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  attritionRate: number;
  averageTenure: number;
  pendingApprovals: number;
}

export interface AttendanceMetrics {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  onLeaveDays: number;
  attendanceRate: number;
  punctualityRate: number;
  departmentBreakdown: {
    departmentId: string;
    departmentName: string;
    attendanceRate: number;
  }[];
}

export interface LeaveMetrics {
  year: number;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysTaken: number;
  averageDaysPerRequest: number;
  departmentBreakdown: {
    departmentId: string;
    departmentName: string;
    totalDays: number;
  }[];
  typeBreakdown: {
    leaveType: string;
    totalDays: number;
  }[];
}

export interface PayrollMetrics {
  year: number;
  totalRuns: number;
  totalGrossPayout: number;
  totalNetPayout: number;
  averageMonthlyPayout: number;
  monthlyBreakdown: {
    month: number;
    grossAmount: number;
    netAmount: number;
    employeeCount: number;
  }[];
}

export interface AttritionData {
  year: number;
  startingHeadcount: number;
  endingHeadcount: number;
  newHires: number;
  terminations: number;
  voluntaryExits: number;
  involuntaryExits: number;
  attritionRate: number;
  monthlyData: {
    month: number;
    hires: number;
    exits: number;
    netChange: number;
  }[];
}

export interface DepartmentMetrics {
  departments: {
    id: string;
    name: string;
    employeeCount: number;
    managerName?: string;
    averageSalary: number;
    totalPayroll: number;
    attendanceRate: number;
    openPositions: number;
  }[];
}

export interface TodayAttendance {
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  total: number;
}

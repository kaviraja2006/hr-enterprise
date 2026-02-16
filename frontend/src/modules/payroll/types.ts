// Payroll Types

export type PayrollStatus = 'draft' | 'approved' | 'processed';

export interface SalaryStructure {
  id: string;
  name: string;
  description?: string;
  basic: number;
  hra: number;
  conveyance: number;
  medicalAllowance: number;
  specialAllowance: number;
  professionalTax: number;
  pf: number;
  esi: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: PayrollStatus;
  approvedBy?: string;
  approvedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  entries?: PayrollEntry[];
}

export interface PayrollEntry {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    profilePicture?: string;
    department?: {
      name: string;
    };
    designation?: {
      title: string;
    };
  };
  grossSalary: number;
  lopDays: number;
  lopDeduction: number;
  totalDeductions: number;
  netSalary: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRunSummary {
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  averageNetSalary: number;
}

export interface CreateSalaryStructureDto {
  name: string;
  description?: string;
  basic: number;
  hra: number;
  conveyance?: number;
  medicalAllowance?: number;
  specialAllowance?: number;
  professionalTax?: number;
  pf?: number;
  esi?: number;
}

export interface UpdateSalaryStructureDto {
  name?: string;
  description?: string;
  basic?: number;
  hra?: number;
  conveyance?: number;
  medicalAllowance?: number;
  specialAllowance?: number;
  professionalTax?: number;
  pf?: number;
  esi?: number;
  isActive?: boolean;
}

export interface CreatePayrollRunDto {
  month: number;
  year: number;
}

export interface PayrollStats {
  totalPayrolls: number;
  totalProcessed: number;
  totalPending: number;
  monthlyPayrollAmount: number;
}

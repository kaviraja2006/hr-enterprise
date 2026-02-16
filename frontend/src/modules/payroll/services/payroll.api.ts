import api from '../../../core/api/axios';
import type {
  SalaryStructure,
  PayrollRun,
  PayrollEntry,
  PayrollRunSummary,
  CreateSalaryStructureDto,
  UpdateSalaryStructureDto,
  CreatePayrollRunDto,
  PayrollStats,
} from '../types';

export const payrollApi = {
  // Salary Structures
  getSalaryStructures: async (): Promise<SalaryStructure[]> => {
    const response = await api.get<SalaryStructure[]>('/payroll/structures');
    return response.data;
  },

  getSalaryStructure: async (id: string): Promise<SalaryStructure> => {
    const response = await api.get<SalaryStructure>(`/payroll/structures/${id}`);
    return response.data;
  },

  createSalaryStructure: async (data: CreateSalaryStructureDto): Promise<SalaryStructure> => {
    const response = await api.post<SalaryStructure>('/payroll/structures', data);
    return response.data;
  },

  updateSalaryStructure: async (id: string, data: UpdateSalaryStructureDto): Promise<SalaryStructure> => {
    const response = await api.patch<SalaryStructure>(`/payroll/structures/${id}`, data);
    return response.data;
  },

  deleteSalaryStructure: async (id: string): Promise<void> => {
    await api.delete(`/payroll/structures/${id}`);
  },

  // Payroll Runs
  getPayrollRuns: async (): Promise<PayrollRun[]> => {
    const response = await api.get<PayrollRun[]>('/payroll/runs');
    return response.data;
  },

  getPayrollRun: async (id: string): Promise<PayrollRun> => {
    const response = await api.get<PayrollRun>(`/payroll/runs/${id}`);
    return response.data;
  },

  createPayrollRun: async (data: CreatePayrollRunDto): Promise<PayrollRun> => {
    const response = await api.post<PayrollRun>('/payroll/runs', data);
    return response.data;
  },

  deletePayrollRun: async (id: string): Promise<void> => {
    await api.delete(`/payroll/runs/${id}`);
  },

  // Payroll Actions
  calculatePayroll: async (id: string): Promise<void> => {
    await api.post(`/payroll/runs/${id}/calculate`);
  },

  approvePayroll: async (id: string): Promise<void> => {
    await api.post(`/payroll/runs/${id}/approve`);
  },

  processPayroll: async (id: string): Promise<void> => {
    await api.post(`/payroll/runs/${id}/process`);
  },

  // Payroll Entries
  getPayrollEntry: async (id: string): Promise<PayrollEntry> => {
    const response = await api.get<PayrollEntry>(`/payroll/entries/${id}`);
    return response.data;
  },

  updatePayrollEntry: async (id: string, data: { lopDays?: number; notes?: string }): Promise<PayrollEntry> => {
    const response = await api.patch<PayrollEntry>(`/payroll/entries/${id}`, data);
    return response.data;
  },

  // Summary & Stats
  getPayrollSummary: async (id: string): Promise<PayrollRunSummary> => {
    const response = await api.get<PayrollRunSummary>(`/payroll/runs/${id}/summary`);
    return response.data;
  },

  getPayrollStats: async (): Promise<PayrollStats> => {
    const response = await api.get<PayrollStats>('/payroll/stats');
    return response.data;
  },
};

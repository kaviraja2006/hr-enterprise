import { api } from './client';
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput, Department, Designation } from '@/types';

export const fetchEmployees = async (): Promise<Employee[]> => {
  const { data } = await api.get('/employees');
  return data;
};

export const fetchEmployeeById = async (id: string): Promise<Employee> => {
  const { data } = await api.get(`/employees/${id}`);
  return data;
};

export const createEmployee = async (payload: CreateEmployeeInput): Promise<Employee> => {
  const { data } = await api.post('/employees', payload);
  return data;
};

export const updateEmployee = async (id: string, payload: UpdateEmployeeInput): Promise<Employee> => {
  const { data } = await api.patch(`/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await api.delete(`/employees/${id}`);
};

export const fetchDepartments = async (): Promise<Department[]> => {
  const { data } = await api.get('/departments');
  return data;
};

export const fetchDesignations = async (): Promise<Designation[]> => {
  const { data } = await api.get('/designations');
  return data;
};

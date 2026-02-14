import { useState } from 'react';
import { useEmployees, useDeleteEmployee } from '../hooks/useEmployee';
import { EmployeeList } from '../components/EmployeeList';
import type { EmployeeListParams } from '../types';

export default function EmployeeListPage() {
  const [params, setParams] = useState<EmployeeListParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useEmployees(params);
  const deleteMutation = useDeleteEmployee();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleParamsChange = (newParams: Partial<EmployeeListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-600 mt-1">
          Manage your organization's employees
        </p>
      </div>

      <EmployeeList
        employees={data?.data || []}
        isLoading={isLoading}
        onDelete={handleDelete}
        params={params}
        onParamsChange={handleParamsChange}
        total={data?.total || 0}
      />
    </div>
  );
}

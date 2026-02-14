import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDepartments, useDeleteDepartment } from '../hooks/useDepartment';
import type { DepartmentListParams } from '../types';
import { Button } from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Spinner';

export default function DepartmentListPage() {
  const [params, setParams] = useState<DepartmentListParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useDepartments(params);
  const deleteMutation = useDeleteDepartment();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil((data?.total || 0) / (params.limit || 10));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage your organization's departments</p>
        </div>
        <Link to="/departments/new">
          <Button variant="primary">Add Department</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Head
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employees
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Spinner size="lg" />
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No departments found
                </td>
              </tr>
            ) : (
              data?.data.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                      {dept.description && (
                        <div className="text-sm text-gray-500">{dept.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.head ? (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-xs">
                            {dept.head.firstName[0]}
                            {dept.head.lastName[0]}
                          </span>
                        </div>
                        <span>
                          {dept.head.firstName} {dept.head.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.employeeCount || 0} employees
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/departments/${dept.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      to={`/departments/${dept.id}/edit`}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(params.page || 1) * (params.limit || 10) - (params.limit || 10) + 1} to{' '}
            {Math.min((params.page || 1) * (params.limit || 10), data?.total || 0)} of{' '}
            {data?.total || 0} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={(params.page || 1) <= 1}
              onClick={() => handlePageChange((params.page || 1) - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={(params.page || 1) >= totalPages}
              onClick={() => handlePageChange((params.page || 1) + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

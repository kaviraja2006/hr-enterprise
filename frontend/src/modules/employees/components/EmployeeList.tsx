import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Employee, EmployeeListParams, EmployeeStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';

interface EmployeeListProps {
  employees: Employee[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  params: EmployeeListParams;
  onParamsChange: (params: Partial<EmployeeListParams>) => void;
  total: number;
}

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  TERMINATED: 'danger',
  SUSPENDED: 'danger',
};

export function EmployeeList({
  employees,
  isLoading,
  onDelete,
  params,
  onParamsChange,
  total,
}: EmployeeListProps) {
  const [searchQuery, setSearchQuery] = useState(params.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onParamsChange({ search: searchQuery, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onParamsChange({ page: newPage });
  };

  const totalPages = Math.ceil(total / (params.limit || 10));

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <select
            value={params.status || ''}
            onChange={(e) => onParamsChange({ status: e.target.value as EmployeeStatus | undefined, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="TERMINATED">Terminated</option>
          </select>

          <Link to="/employees/new">
            <Button variant="primary">Add Employee</Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {employee.profilePicture ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={employee.profilePicture}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {employee.firstName[0]}
                              {employee.lastName[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.department?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.designation?.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusColors[employee.status]}>
                      {employee.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/employees/${employee.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    <Link
                      to={`/employees/${employee.id}/edit`}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(employee.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(params.page || 1) * (params.limit || 10) - (params.limit || 10) + 1} to{' '}
            {Math.min((params.page || 1) * (params.limit || 10), total)} of {total} results
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

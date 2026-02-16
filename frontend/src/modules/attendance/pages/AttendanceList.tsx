import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAttendance, useDeleteAttendance } from '../hooks/useAttendance';
import type { AttendanceListParams, AttendanceStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';

export default function AttendanceList() {
  const [params, setParams] = useState<AttendanceListParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useAttendance(params);
  const deleteMutation = useDeleteAttendance();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleParamsChange = (newParams: Partial<AttendanceListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const totalPages = Math.ceil((data?.total || 0) / (params.limit || 10));

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      PRESENT: 'success',
      ABSENT: 'danger',
      LATE: 'warning',
      HALF_DAY: 'warning',
      ON_LEAVE: 'default',
    };
    return colors[status] || 'default';
  };

  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-gray-600 mt-1">
          Browse and manage attendance records for all employees
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex gap-2 flex-1">
            <input
              type="date"
              value={params.startDate || getDefaultDateRange().startDate}
              onChange={(e) => handleParamsChange({ startDate: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="flex items-center text-gray-500">to</span>
            <input
              type="date"
              value={params.endDate || getDefaultDateRange().endDate}
              onChange={(e) => handleParamsChange({ endDate: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={params.status || ''}
            onChange={(e) => handleParamsChange({ status: (e.target.value as AttendanceStatus) || undefined, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          <Link to="/attendance/new">
            <Button variant="primary">Add Record</Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Work Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : !data?.data || data.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              data.data.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(attendance.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {attendance.employee?.profilePicture ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={attendance.employee.profilePicture}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {attendance.employee?.firstName?.[0]}
                              {attendance.employee?.lastName?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {attendance.employee?.firstName} {attendance.employee?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{attendance.employee?.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.checkIn
                      ? new Date(attendance.checkIn).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.checkOut
                      ? new Date(attendance.checkOut).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.workHours ? `${attendance.workHours}h` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(attendance.status)}>
                      {attendance.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => alert('Edit functionality coming soon')}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(attendance.id)}
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
            Showing {((params.page || 1) - 1) * (params.limit || 10) + 1} to{' '}
            {Math.min((params.page || 1) * (params.limit || 10), data?.total || 0)} of {data?.total} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={(params.page || 1) <= 1}
              onClick={() => handleParamsChange({ page: (params.page || 1) - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={(params.page || 1) >= totalPages}
              onClick={() => handleParamsChange({ page: (params.page || 1) + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

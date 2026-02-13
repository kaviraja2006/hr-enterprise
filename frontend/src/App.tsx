import { useState } from 'react';
import {
  useEmployees,
  useCreateEmployee,
  useDeleteEmployee,
} from '@/hooks/useEmployees';
import {
  useLeaveRequests,
  usePendingLeaveRequests,
  useCreateLeaveRequest,
  useApproveLeaveRequest,
} from '@/hooks/useLeaveRequests';
import type { CreateEmployeeInput, CreateLeaveRequestInput } from '@/types';

function App() {
  const [activeTab, setActiveTab] = useState<'employees' | 'leaves'>('employees');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">HR Management System</h1>
      
      <div className="mb-6">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 mr-2 rounded ${
            activeTab === 'employees' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded ${
            activeTab === 'leaves' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Leave Requests
        </button>
      </div>

      {activeTab === 'employees' ? <EmployeesTab /> : <LeaveRequestsTab />}
    </div>
  );
}

function EmployeesTab() {
  const { data: employees, isLoading, error } = useEmployees();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();
  
  const [formData, setFormData] = useState<CreateEmployeeInput>({
    userId: '',
    employeeCode: '',
    firstName: '',
    lastName: '',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployee.mutate(formData, {
      onSuccess: () => {
        setFormData({
          userId: '',
          employeeCode: '',
          firstName: '',
          lastName: '',
          joinDate: new Date().toISOString().split('T')[0],
        });
      },
    });
  };

  if (isLoading) return <div>Loading employees...</div>;
  if (error) return <div className="text-red-500">Error loading employees: {error.message}</div>;

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Employee</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="User ID (UUID)"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Employee Code (e.g., EMP001)"
            value={formData.employeeCode}
            onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            value={formData.joinDate}
            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            disabled={createEmployee.isPending}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Employee List ({employees?.length || 0})
        </h2>
        {employees?.length === 0 ? (
          <p className="text-gray-500">No employees found. Create one above!</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees?.map((emp) => (
                <tr key={emp.id} className="border-b">
                  <td className="p-2">{emp.employeeCode}</td>
                  <td className="p-2">{emp.firstName} {emp.lastName}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteEmployee.mutate(emp.id)}
                      disabled={deleteEmployee.isPending}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function LeaveRequestsTab() {
  const { data: leaveRequests, isLoading, error } = useLeaveRequests();
  const { data: pendingRequests } = usePendingLeaveRequests();
  const createLeave = useCreateLeaveRequest();
  const approveLeave = useApproveLeaveRequest();
  
  const [formData, setFormData] = useState<CreateLeaveRequestInput>({
    employeeId: '',
    startDate: '',
    endDate: '',
    leaveType: 'annual',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLeave.mutate(formData, {
      onSuccess: () => {
        setFormData({
          employeeId: '',
          startDate: '',
          endDate: '',
          leaveType: 'annual',
          reason: '',
        });
      },
    });
  };

  if (isLoading) return <div>Loading leave requests...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Leave Request</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Employee ID"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <select
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as CreateLeaveRequestInput['leaveType'] })}
            className="border p-2 rounded"
          >
            <option value="annual">Annual</option>
            <option value="sick">Sick</option>
            <option value="casual">Casual</option>
            <option value="maternity">Maternity</option>
            <option value="paternity">Paternity</option>
            <option value="bereavement">Bereavement</option>
          </select>
          <input
            type="date"
            placeholder="Start Date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            placeholder="End Date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Reason (optional)"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="border p-2 rounded col-span-2"
          />
          <button
            type="submit"
            disabled={createLeave.isPending}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {createLeave.isPending ? 'Creating...' : 'Create Request'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Pending Approvals ({pendingRequests?.length || 0})
          </h2>
          {pendingRequests?.length === 0 ? (
            <p className="text-gray-500">No pending requests</p>
          ) : (
            <div className="space-y-2">
              {pendingRequests?.map((req) => (
                <div key={req.id} className="border p-3 rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{req.leaveType} Leave</p>
                    <p className="text-sm text-gray-600">
                      {req.startDate} to {req.endDate}
                    </p>
                  </div>
                  <button
                    onClick={() => approveLeave.mutate(req.id)}
                    disabled={approveLeave.isPending}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            All Requests ({leaveRequests?.length || 0})
          </h2>
          {leaveRequests?.length === 0 ? (
            <p className="text-gray-500">No leave requests</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {leaveRequests?.map((req) => (
                <div key={req.id} className="border p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{req.leaveType} Leave</p>
                      <p className="text-sm text-gray-600">
                        {req.startDate} to {req.endDate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      req.status === 'approved' ? 'bg-green-100 text-green-800' :
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
